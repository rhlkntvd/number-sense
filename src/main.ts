import './style.css'

type Range = {
  min: number,
  max: number
}

type AdditiveConfig = {
  addition: boolean
  subtraction: boolean
  left: Range
  right: Range
}

type MultiplicativeConfig = {
  multiplication: boolean
  division: boolean
  left: Range
  right: Range
}

type OperationConfig = {
  additive?: AdditiveConfig
  multiplicative?: MultiplicativeConfig
}

type DrillMode =
| { type: 'count'
    count: number 
  }
| {
  type: 'duration'
  duration: number
}

type Configuration = {
  operations: OperationConfig,
  drillMode: DrillMode
}

function getInteger(formData: FormData, name: string): number {
  const value = formData.get(name)

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`missing value for ${name}`)
  }

  const number = Number(value)

  if (!Number.isInteger(number)) {
    throw new Error(`${name} must be an integer`)
  }

  return number
}

function getRange(
  formData: FormData,
  minName: string,
  maxName: string,
): Range {
  const min = getInteger(formData, minName)
  const max = getInteger(formData, maxName)

  if (min < 0 || max < 0) {
    throw new Error('range values cannot be negative')
  }

  if (min > max) {
    throw new Error('range minimum cannot be greater than maximum')
  }

  return {
    min,
    max,
  }
}

function parseConfiguration(formData: FormData): Configuration {
  const addition = formData.has('addition')
  const subtraction = formData.has('subtraction')
  const multiplication = formData.has('multiplication')
  const division = formData.has('division')

  if (!addition && !subtraction && !multiplication && !division) {
    throw new Error('at least one operation must be selected')
  }

  const operations: OperationConfig = {}

  if (addition || subtraction) {
    operations.additive = {
      addition,
      subtraction,

      left: getRange(
        formData,
        'additive-left-min',
        'additive-left-max',
      ),

      right: getRange(
        formData,
        'additive-right-min',
        'additive-right-max',
      ),
    }
  }

  if (multiplication || division) {
    operations.multiplicative = {
      multiplication,
      division,

      left: getRange(
        formData,
        'multiplicative-left-min',
        'multiplicative-left-max',
      ),

      right: getRange(
        formData,
        'multiplicative-right-min',
        'multiplicative-right-max',
      ),
    }
  }

  const mode = formData.get('drill-mode')

  let drillMode: DrillMode

  if (mode === 'count') {
    drillMode = {
      type: 'count',
      count: getInteger(formData, 'count'),
    }
  } else if (mode === 'duration') {
    drillMode = {
      type: 'duration',
      duration: getInteger(formData, 'duration'),
    }
  } else {
    throw new Error('invalid drill mode')
  }

  return {
    operations,
    drillMode,
  }
}

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('app element not found')
}

app.innerHTML = `
  <main>
    <h1>Number Sense</h1>
    <h3>an arithmetic game</h3>

    <form id="configuration-form">

      <fieldset>
        <legend>Operations</legend>

        <fieldset>
          <legend>(+/-)</legend>

          <label>
            <input type="checkbox" name="addition" checked />
            Addition
          </label>

          <label>
            <input type="checkbox" name="subtraction" checked />
            Subtraction
          </label>

          <p>Shared Ranges</p>

          <div>
            <span>(</span>

            <input
              type="number"
              name="additive-left-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="additive first number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="additive-left-max"
              value="100"
              min="0"
              step="1"
              required
              aria-label="additive first number maximum"
            />

            <span>) + (</span>

            <input
              type="number"
              name="additive-right-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="additive second number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="additive-right-max"
              value="100"
              min="0"
              step="1"
              required
              aria-label="additive second number maximum"
            />

            <span>)</span>
          </div>
          <p>Subtraction reverses problems generated from these ranges.</p>
        </fieldset>

        <fieldset>
          <legend>(x/÷)</legend>

          <label>
            <input type="checkbox" name="multiplication" checked />
            Multiplication
          </label>

          <label>
            <input type="checkbox" name="division" checked />
            Division
          </label>

          <p>Shared Ranges</p>

          <div>
            <span>(</span>

            <input
              type="number"
              name="multiplicative-left-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="multiplicative first number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="multiplicative-left-max"
              value="12"
              min="0"
              step="1"
              required
              aria-label="multiplicative first number maximum"
            />

            <span>) x (</span>

            <input
              type="number"
              name="multiplicative-right-min"
              value="2"
              min="0"
              step="1"
              required
              aria-label="multiplicative second number minimum"
            />

            <span>to</span>

            <input
              type="number"
              name="multiplicative-right-max"
              value="100"
              min="0"
              step="1"
              required
              aria-label="multiplicative second number maximum"
            />

            <span>)</span>
          </div>
          <p>Division reverses problems generated from these ranges.</p>
        </fieldset>
      </fieldset>

      <fieldset>
        <legend>Drill Mode</legend>

        <label>
          <input
            type="radio"
            name="drill-mode"
            value="count"
            checked
          />
          Count
        </label>

          <select name="count" aria-label="count">
            <option value="10">10 questions</option>
            <option value="25" selected>25 questions</option>
            <option value="50">50 questions</option>
            <option value="75">75 questions</option>
            <option value="100">100 questions</option>
          </select>

        <label>
          <input
            type="radio"
            name="drill-mode"
            value="duration"
          />
          Duration
        </label>

          <select name="duration" aria-label="duration">
            <option value="30">30 seconds</option>
            <option value="60">60 seconds</option>
            <option value="120" selected>120 seconds</option>
            <option value="180">180 seconds</option>
            <option value="300">300 seconds</option>
          </select>
      </fieldset>

      <button type="submit">Start</button>

    </form>
  </main>
`

const configurationForm =
  document.querySelector<HTMLFormElement>('#configuration-form')

if (!configurationForm) {
  throw new Error('configuration form not found')
}

const countRadio =
  configurationForm.querySelector<HTMLInputElement>(
    'input[name="drill-mode"][value="count"]'
  )

const durationRadio =
  configurationForm.querySelector<HTMLInputElement>(
    'input[name="drill-mode"][value="duration"]'
  )

const countSelect =
  configurationForm.querySelector<HTMLSelectElement>(
    'select[name="count"]'
  )

const durationSelect =
  configurationForm.querySelector<HTMLSelectElement>(
    'select[name="duration"]'
  )

if (!countRadio || !durationRadio || !countSelect || !durationSelect) {
  throw new Error('drill mode controls not found')
}

const updateDrillModeControls = () => {
  countSelect.disabled = !countRadio.checked
  durationSelect.disabled = !durationRadio.checked
}

countRadio.addEventListener('change', updateDrillModeControls)
durationRadio.addEventListener('change', updateDrillModeControls)

updateDrillModeControls()

const additionCheckbox =
  configurationForm.querySelector<HTMLInputElement>(
    'input[name="addition"]'
  )

const subtractionCheckbox =
  configurationForm.querySelector<HTMLInputElement>(
    'input[name="subtraction"]'
  )

const multiplicationCheckbox =
  configurationForm.querySelector<HTMLInputElement>(
    'input[name="multiplication"]'
  )

const divisionCheckbox =
  configurationForm.querySelector<HTMLInputElement>(
    'input[name="division"]'
  )

if (
  !additionCheckbox ||
  !subtractionCheckbox ||
  !multiplicationCheckbox ||
  !divisionCheckbox
) {
  throw new Error('operation controls not found')
}

const additiveRangeInputs =
  configurationForm.querySelectorAll<HTMLInputElement>(
    'input[name^="additive-"]'
  )

const multiplicativeRangeInputs =
  configurationForm.querySelectorAll<HTMLInputElement>(
    'input[name^="multiplicative-"]'
  )

const updateOperationControls = () => {
  const additiveEnabled =
    additionCheckbox.checked || subtractionCheckbox.checked

  const multiplicativeEnabled =
    multiplicationCheckbox.checked || divisionCheckbox.checked

  additiveRangeInputs.forEach((input) => {
    input.disabled = !additiveEnabled
  })

  multiplicativeRangeInputs.forEach((input) => {
    input.disabled = !multiplicativeEnabled
  })
}

additionCheckbox.addEventListener('change', updateOperationControls)
subtractionCheckbox.addEventListener('change', updateOperationControls)
multiplicationCheckbox.addEventListener('change', updateOperationControls)
divisionCheckbox.addEventListener('change', updateOperationControls)

updateOperationControls()

configurationForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const formData = new FormData(configurationForm)

  try {
    const configuration = parseConfiguration(formData)

    console.log(configuration)
  } catch (error) {
    console.error(error)
  }
})