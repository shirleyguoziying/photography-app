const { BOOKING_STEPS } = require('../../config/constants')

Component({
  properties: {
    currentStep: { type: Number, value: 0 },
  },
  data: {
    steps: BOOKING_STEPS,
  }
})
