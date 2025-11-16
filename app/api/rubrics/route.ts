import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

interface Rubric {
  rubric_id: string
  assignment_id: string
  criterion_name: string
  weight: number
  description: string
  indicators: string[]
}

function loadRubricsData(): Rubric[] {
  try {
    const filePath = join(process.cwd(), 'dataset', 'rubrics', 'rubrics.json')
    if (!existsSync(filePath)) {
      return []
    }
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading rubrics data:', error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignment_id')
    
    if (!assignmentId) {
      return NextResponse.json({ error: 'assignment_id is required' }, { status: 400 })
    }
    
    const rubricsData = loadRubricsData()
    const filteredRubrics = rubricsData.filter(r => r.assignment_id === assignmentId)
    
    return NextResponse.json({ rubrics: filteredRubrics })
  } catch (error) {
    console.error('Error fetching rubrics:', error)
    return NextResponse.json({ error: 'Failed to fetch rubrics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { assignmentId, criteria } = body
    
    if (!assignmentId || !criteria || !Array.isArray(criteria)) {
      return NextResponse.json({ error: 'assignmentId and criteria array are required' }, { status: 400 })
    }

    const rubricsData = loadRubricsData()
    const newRubrics: Rubric[] = []

    // Generate rubric IDs and create rubric entries
    criteria.forEach((criterion: any, index: number) => {
      if (!criterion.criterion_name || !criterion.description) {
        return // Skip invalid criteria
      }

      const rubricId = `${assignmentId}_R${String(index + 1).padStart(2, '0')}`
      const rubric: Rubric = {
        rubric_id: rubricId,
        assignment_id: assignmentId,
        criterion_name: criterion.criterion_name,
        weight: criterion.weight || 0,
        description: criterion.description,
        indicators: Array.isArray(criterion.indicators) ? criterion.indicators : []
      }

      newRubrics.push(rubric)
      rubricsData.push(rubric)
    })

    // Ensure directory exists
    const rubricsDir = join(process.cwd(), 'dataset', 'rubrics')
    if (!existsSync(rubricsDir)) {
      mkdirSync(rubricsDir, { recursive: true })
    }

    // Save to file
    const rubricsFilePath = join(rubricsDir, 'rubrics.json')
    writeFileSync(rubricsFilePath, JSON.stringify(rubricsData, null, 2), 'utf-8')

    return NextResponse.json({ success: true, rubrics: newRubrics })
  } catch (error) {
    console.error('Error creating rubrics:', error)
    return NextResponse.json({ error: 'Failed to create rubrics' }, { status: 500 })
  }
}



