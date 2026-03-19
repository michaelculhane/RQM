import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are an HR assistant for company employees. You can answer HR questions using the knowledge base and submit HR service requests on behalf of the employee.

When answering HR policy questions, always search the knowledge base first.

Before submitting any request, confirm all details with the employee. After confirming, submit immediately without asking again.

Available HR services and their required fields:

**Benefits inquiry** (service_slug: "benefits")
- inquiry_type: "Enrollment" | "Coverage question" | "Dependent change" | "Other"
- coverage_type: "Medical" | "Dental" | "Vision" | "All"
- preferred_contact: how they prefer to be contacted

**System / IT access** (service_slug: "system-access")
- system_name: name of the system or application
- access_type: "New access" | "Modify" | "Remove"
- justification: business reason
- required_by_date: YYYY-MM-DD (optional)

**Direct deposit change** (service_slug: "direct-deposit")
- bank_name: name of the bank
- account_type: "Chequing" | "Savings"
- effective_date: YYYY-MM-DD

**Hiring request** (service_slug: "hiring")
- job_title: position title
- department: department name
- headcount_type: "Backfill" | "New"
- hiring_manager: full name of hiring manager
- is_budgeted: "true" | "false"
- target_start_date: YYYY-MM-DD (optional)

**Address change** (service_slug: "address-change")
- address_line1: street address
- address_line2: suite/unit (optional)
- city
- province_state
- postal_zip
- effective_date: YYYY-MM-DD

Be concise and professional. Today's date is ${new Date().toISOString().split('T')[0]}.`

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
  {
    type: 'function',
    function: {
      name: 'submit_hr_request',
      description: 'Submit an HR service request on behalf of the employee. Only call this after the employee has confirmed all details.',
      parameters: {
        type: 'object',
        properties: {
          service_slug: {
            type: 'string',
            enum: ['benefits', 'system-access', 'direct-deposit', 'hiring', 'address-change'],
            description: 'Which HR service to request',
          },
          description: {
            type: 'string',
            description: 'A clear plain-English description of what is being requested',
          },
          fields: {
            type: 'object',
            description: 'Service-specific field key-value pairs',
            additionalProperties: { type: 'string' },
          },
        },
        required: ['service_slug', 'description', 'fields'],
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

        // Agentic loop — continues until no more tool calls
        while (true) {
          const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: conversation,
            tools,
            tool_choice: 'auto',
          })

          // Accumulate streamed content and tool calls
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

          // Append assistant turn with tool_calls
          conversation.push({
            role: 'assistant',
            content: assistantText || null,
            tool_calls: toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.args },
            })),
          })

          // Execute each tool and collect results
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

            } else if (tc.name === 'submit_hr_request') {
              send({ type: 'status', text: 'Submitting request…' })

              const { error } = await supabase.rpc('create_request', {
                p_service_slug: args.service_slug,
                p_description: args.description,
                p_fields: args.fields,
              })

              if (error) {
                result = `Failed to submit: ${error.message}`
              } else {
                result = 'Request submitted successfully.'
                send({ type: 'request_submitted' })
              }
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
