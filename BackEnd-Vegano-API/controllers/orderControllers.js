const asyncHandler = require('express-async-handler')
const Order = require('../models/Order')

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = asyncHandler(async (req, res) => {
	try {
		const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body

		if (orderItems && orderItems.length === 0) {
			res.status(400)
			throw new Error('No order items')
			return
		} else {
			const order = new Order({
				orderItems,
				user: req.user._id,
				shippingAddress,
				paymentMethod,
				itemsPrice,
				taxPrice,
				shippingPrice,
				totalPrice,
			})

			const createdOrder = await order.save()

			res.status(201).json(createdOrder)
		}
	} catch (error) {
		res.status(400).json({ message: `${error}` })
	}
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
	try {
		const order = await Order.findById(req.params.id).populate('user', 'name email')

		if (order) {
			res.json(order)
		}
	} catch (error) {
		res.status(400).json({ message: `${error}` })
	}
})

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)

		if (order) {
			order.isPaid = true
			order.paidAt = Date.now()
			order.paymentResult = {
				id: req.body.id,
				status: req.body.status,
				update_time: req.body.update_time,
				email_address: req.body.payer.email_address,
			}

			const updatedOrder = await order.save()

			res.json(updatedOrder)
		}
	} catch (error) {
		res.status(400).json({ message: `${error}` })
	}
})

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = asyncHandler(async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)

		if (order) {
			order.isDelivered = true
			order.deliveredAt = Date.now()

			const updatedOrder = await order.save()

			res.json(updatedOrder)
		}
	} catch (error) {
		res.status(400).json({ message: `${error}` })
	}
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id })
		res.status(200).json(orders)
	} catch (error) {
		res.status(400).json({ message: `${error}` })
	}
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
	try {
		const orders = await Order.find({}).populate('user', 'id name')
		res.status(200).json(orders)
	} catch (error) {
		res.status(400).json({ message: `${error}` })
	}
})
