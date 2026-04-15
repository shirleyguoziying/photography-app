const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()

  try {
    const bookingData = event.booking
    const openid = context.OPENID || null
    
    const newBooking = {
      ...bookingData,
      _openid: openid,
      status: 'pending',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    }

    const result = await db.collection('bookings')
      .add({
        data: newBooking
      })

    return { 
      success: true, 
      bookingId: result._id,
      message: '订单创建成功'
    }
  } catch (err) {
    return { 
      success: false, 
      error: err.message 
    }
  }
}