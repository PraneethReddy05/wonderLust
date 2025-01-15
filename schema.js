const Joi = require('joi');

const listingSchema = Joi.object({
    title:Joi.string().required(),
    des:Joi.string().required(),
    location:Joi.string().required(),
    country:Joi.string().required(),
    // image:Joi.string().allow('',null),
    price:Joi.number().required().min(0),
});

module.exports =listingSchema;