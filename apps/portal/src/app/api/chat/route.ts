import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

const tools: Anthropic.Tool[] = [
  {
    name: 'search_knowledge_base',
    description: 'Search published HR knowledge base articles for policies, procedures, benefits information, and other HR-related topics. Call this before answering any HR policy question.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords or question to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'submit_hr_request',
    description: 'Submit an HR service request on behalf of the employee. Only call this after the employee has confirmed all details.',
    input_schema: {
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
        },
      },
      required: ['service_slug', 'description', 'fields'],
    },
  },
]

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages } = await req.json() as { messages: Anthropic.MessageParam[] }

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        let conversation: Anthropic.MessageParam[] = [...messages]

        // Agentic loop — runs until end_turn or no more tool calls
        while (true) {
          const claudeStream = anthropic.messages.stream({
            model: 'claude-opus-4-6',
            max_tokens: 4096,
            thinking: { type: 'adaptive' },
            system: SYSTEM_PROMPT,
            tools,
            messages: conversation,
          })

          // Stream text deltas to the client as they arrive
          for await (const event of claudeStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              send({ type: 'text', text: event.delta.text })
            }
          }

          const message = await claudeStream.finalMessage()

          if (message.stop_reason === 'end_turn') break

          if (message.stop_reason === 'tool_use') {
            // Append full assistant turn (including any thinking blocks)
            conversation.push({ role: 'assistant', content: message.content })

            const toolResults: Anthropic.ToolResultBlockParam[] = []

            for (const block of message.content) {
              if (block.type !== 'tool_use') continue

              let result: string

              if (block.name === 'search_knowledge_base') {
                send({ type: 'status', text: 'Searching knowledge base…' })
                const input = block.input as { query: string }

                const { data: articles } = await supabase
                  .from('knowledge_articles')
                  .select('title, body, category')
                  .eq('status', 'published')
                  .or(`title.ilike.%${input.query}%,body.ilike.%${input.query}%`)
                  .limit(3)

                result = articles?.length
                  ? articles.map(a =>
                      `### ${a.title}${a.category ? ` (${a.category})` : ''}\n${a.body}`
                    ).join('\n\n---\n\n')
                  : 'No articles found. Try different keywords.'

              } else if (block.name === 'submit_hr_request') {
                send({ type: 'status', text: 'Submitting request…' })
                const input = block.input as {
                  service_slug: string
                  description: string
                  fields: Record<string, string>
                }

                const { error } = await supabase.rpc('create_request', {
                  p_service_slug: input.service_slug,
                  p_description: input.description,
                  p_fields: input.fields,
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

              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: result,
              })
            }

            conversation.push({ role: 'user', content: toolResults })
          } else {
            break
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
