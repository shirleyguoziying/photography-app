const { get } = require('../utils/request')

async function listPhotographers(params = {}) {
  const res = await get('/photographers', params)
  return res.data // { list, total, page, pageSize }
}

async function getPhotographer(id) {
  const res = await get(`/photographers/${id}`)
  return res.data
}

/**
 * Get available time slots for a date range
 * @param {string} id - photographerId
 * @param {string} from - YYYY-MM-DD
 * @param {string} to - YYYY-MM-DD
 */
async function getAvailability(id, from, to) {
  const res = await get(`/photographers/${id}/availability`, { from, to })
  return res.data // [{ date, slots: [{ slotId, startTime, endTime, isBooked }] }]
}

module.exports = { listPhotographers, getPhotographer, getAvailability }
