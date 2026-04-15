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
  const errors = []
  if (!data.props || !data.props.characterName || !data.props.characterName.trim()) {
    errors.push('请填写出演角色名')
  }
  if (!data.props || !data.props.referenceImages || data.props.referenceImages.length === 0) {
    errors.push('请至少上传一张角色参考图')
  }
  return errors
}

function validateStep3(data) {
  const errors = []
  if (!data.stylePreferences || !data.stylePreferences.shootPreference) {
    errors.push('请选择拍摄偏好')
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
