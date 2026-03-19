import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are an HR assistant for company employees. You answer HR questions using the knowledge base and direct employees to the right form when they want to submit a request.

When answering HR policy questions, always search the knowledge base first.

When an employee wants to submit an HR request, give them the direct link to the form — do not collect information or submit on their behalf.

Request form links (use markdown link syntax):
- Benefits inquiry → /requests/new?service=benefits
- IT / system access → /requests/new?service=system-access
- Direct deposit change → /requests/new?service=direct-deposit
- Hiring request → /requests/new?service=hiring
- Address change → /requests/new?service=address-change
- Browse all services → /services

Be concise and professional.`

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_knowledge_base',
      description: 'Search published HR knowledge base articles for policies, procedures, benefits information, and other HR-related topics. Call this before answering any HR policy question.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Keywords or question to search for' },
        },
        required: ['query'],
      },
    },
  },
]

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
  }

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const conversation: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ]

        while (true) {
          const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: conversation,
            tools,
            tool_choice: 'auto',
          })

          let assistantText = ''
          const toolCallsMap: Record<number, { id: string; name: string; args: string }> = {}
          let finishReason: string | null = null

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta
            if (!delta) continue

            if (delta.content) {
              assistantText += delta.content
              send({ type: 'text', text: delta.content })
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (!toolCallsMap[tc.index]) {
                  toolCallsMap[tc.index] = { id: '', name: '', args: '' }
                }
                if (tc.id) toolCallsMap[tc.index].id = tc.id
                if (tc.function?.name) toolCallsMap[tc.index].name += tc.function.name
                if (tc.function?.arguments) toolCallsMap[tc.index].args += tc.function.arguments
              }
            }

            if (chunk.choices[0]?.finish_reason) {
              finishReason = chunk.choices[0].finish_reason
            }
          }

          const toolCalls = Object.values(toolCallsMap)

          if (finishReason !== 'tool_calls' || toolCalls.length === 0) break

          conversation.push({
            role: 'assistant',
            content: assistantText || null,
            tool_calls: toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.args },
            })),
          })

          for (const tc of toolCalls) {
            let result: string
            const args = JSON.parse(tc.args)

            if (tc.name === 'search_knowledge_base') {
              send({ type: 'status', text: 'Searching knowledge base…' })

              const { data: articles } = await supabase
                .from('knowledge_articles')
                .select('title, body, category')
                .eq('status', 'published')
                .or(`title.ilike.%${args.query}%,body.ilike.%${args.query}%`)
                .limit(3)

              result = articles?.length
                ? articles
                    .map(a => `### ${a.title}${a.category ? ` (${a.category})` : ''}\n${a.body}`)
                    .join('\n\n---\n\n')
                : 'No articles found. Try different keywords.'
            } else {
              result = 'Unknown tool.'
            }

            conversation.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: result,
            })
          }
        }

        send({ type: 'done' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred'
        send({ type: 'error', message: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
