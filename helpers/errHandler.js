const  errorHandler = (err, req, res, next) => {
	console.error(err, '<<<==== YOUR ERROR!');
	let  msg = `Internal server error`
	let  status = 500

	switch (err.name) {
		case  "SequelizeValidationError":
			msg =  err.errors.map(el  => {
				return {message:  el.message}
			})
			status = 400
		break
		case  "SequelizeUniqueConstraintError":
			msg =  err.errors.map(el  => {
				return {message:  el.message}
			})
			status = 400
		break
		case  "Invalid token":
			msg = "Invalid token"
			status = 401
		break
		case  "Unauthorized":
			msg = "Invalid email/password"
			status = 401
		break		
		case  "Forbidden":
			msg = "You are not authorized"
			status = 403
		break
		case  "Not Found":
			msg = 'Hero not found'
			status = 404
		break
	}

	res.status(status).json({message: msg})
}

module.exports = errorHandler