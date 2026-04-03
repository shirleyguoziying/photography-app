/**
 * Validate booking step data before allowing progression
 */

function validateStep0(data) {
  const errors = []
  if (!data.preferredDate) errors.push('请选择拍摄日期')
  if (!data.preferredTime) errors.push('请选择拍摄时间')
  if (!data.duration) errors.push('请选择拍摄时长')
  return errors
}

function validateStep1(data) {
  const errors = []
  if (!data.location || !data.location.name) errors.push('请选择拍摄地点')
  return errors
}

function validateStep2(data) {
  // Props step is optional — no required fields
  return []
}

function validateStep3(data) {
  const errors = []
  if (!data.stylePreferences || data.stylePreferences.tags.length === 0) {
    errors.push('请至少选择一个风格标签')
  }
  return errors
}

const STEP_VALIDATORS = [validateStep0, validateStep1, validateStep2, validateStep3]

function validateStep(stepIndex, data) {
  const validator = STEP_VALIDATORS[stepIndex]
  if (!validator) return []
  return validator(data)
}

/**
 * Show validation errors as a toast/modal
 */
function showErrors(errors) {
  if (errors.length === 0) return
  wx.showToast({ title: errors[0], icon: 'none', duration: 2000 })
}

module.exports = { validateStep, showErrors }
