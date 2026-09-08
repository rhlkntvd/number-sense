import type {
  AdditiveConfig,
  Configuration,
  MultiplicativeConfig,
} from './configuration'

// private types
type ProblemGenerator = () => Problem | null

type Operation =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'

// exported types
export type Problem = {
  left: number
  right: number
  operation: Operation
  answer: number
}

// private helpers
function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function canGenerateDivision(
  config: MultiplicativeConfig,
): boolean {
  return config.left.max > 0 || config.right.max > 0
}

function randomItem<T>(items: T[]): T {
  const index = randomInteger(0, items.length - 1)
  return items[index]
}

// private problem generators
function generateAdditionProblem(
  config: AdditiveConfig,
): Problem {
  const left = randomInteger(
    config.left.min,
    config.left.max,
  )

  const right = randomInteger(
    config.right.min,
    config.right.max,
  )

  return {
    left,
    right,
    operation: 'addition',
    answer: left + right,
  }
}

function generateSubtractionProblem(
  config: AdditiveConfig,
): Problem {
  const firstAddend = randomInteger(
    config.left.min,
    config.left.max,
  )

  const secondAddend = randomInteger(
    config.right.min,
    config.right.max,
  )

  return {
    left: firstAddend + secondAddend,
    right: firstAddend,
    operation: 'subtraction',
    answer: secondAddend,
  }
}

function generateMultiplicationProblem(
  config: MultiplicativeConfig,
): Problem {
  const left = randomInteger(
    config.left.min,
    config.left.max,
  )

  const right = randomInteger(
    config.right.min,
    config.right.max,
  )

  return {
    left,
    right,
    operation: 'multiplication',
    answer: left * right,
  }
}

export function generateDivisionProblem(
  config: MultiplicativeConfig,
): Problem | null {
  if (!canGenerateDivision(config)) {
    return null
  }

  let firstFactor: number
  let secondFactor: number

  do {
    firstFactor = randomInteger(
      config.left.min,
      config.left.max,
    )

    secondFactor = randomInteger(
      config.right.min,
      config.right.max,
    )
  } while (firstFactor === 0 && secondFactor === 0)

  const product = firstFactor * secondFactor

  if (firstFactor !== 0) {
    return {
      left: product,
      right: firstFactor,
      operation: 'division',
      answer: secondFactor,
    }
  }

  return {
    left: product,
    right: secondFactor,
    operation: 'division',
    answer: firstFactor,
  }
}

// exported problem generator
export function generateProblem(
  configuration: Configuration,
): Problem | null {
  const generators: ProblemGenerator[] = []

  const additive = configuration.operations.additive

  if (additive?.addition) {
    generators.push(() =>
      generateAdditionProblem(additive)
    )
  }

  if (additive?.subtraction) {
    generators.push(() =>
      generateSubtractionProblem(additive)
    )
  }

  const multiplicative =
    configuration.operations.multiplicative

  if (multiplicative?.multiplication) {
    generators.push(() =>
      generateMultiplicationProblem(multiplicative)
    )
  }

  if (
    multiplicative?.division &&
    canGenerateDivision(multiplicative)
  ) {
    generators.push(() =>
      generateDivisionProblem(multiplicative)
    )
  }

  if (generators.length === 0) {
    return null
  }

  return randomItem(generators)()
}