import { Listing } from '../models/Listing.js';
import Joi from 'joi';
// TODO: write a validation schema for create/update per README.md section 2.

// GET /api/listings
// TODO: implement per README.md section 3.
const CreateListingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid('textbooks', 'electronics', 'furniture', 'clothing', 'other').default('other'),
  condition: Joi.string().valid('new', 'like-new', 'used', 'worn').default('used'),
  status: Joi.string().valid('active', 'sold', 'removed').default('active')
});

const updateListingSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  price: Joi.number().min(0),
  category: Joi.string().valid('textbooks', 'electronics', 'furniture', 'clothing', 'other').default('other'),
  condition: Joi.string().valid('new', 'like-new', 'used', 'worn').default('used'),
  status: Joi.string().valid('active', 'sold', 'removed').default('active') 
});

function publicListing(l) {
  return { id: l._id.toString(), title: l.title, description: l.description, price: l.price, category: l.category, condition: l.condition, status: l.status, createdAt: l.createdAt };
}

export async function getListing(req, res, next) {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      status: { $ne: 'removed' }
    })
      .populate('seller', 'name email')
      .lean();

    if (!listing)
      return res.status(404).json({ message: 'Listing not found' });

    res.json({ listing: publicListing(listing) });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getAllListings(req, res, next) {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .populate('seller', 'name email')
      .lean();

    res.json({ listings: listings.map(publicListing) });
  } catch (err) {
    next(err);
  }
}
// POST /api/listings
// TODO: implement per README.md section 3.
export async function createListing(req, res, next) {
  try {
    const{value, error} = CreateListingSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const listing=await Listing.create(value);
    res.status(201).json({ listing });
  } catch (err) { next(err); }
}

// PATCH /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateListing(req, res, next) {
  try {
    const { value, error } = updateListingSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });
    
    const doc = await Listing.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Listing not found' });
    
    res.json({ listing: doc });
  } catch (err) { next(err); }
}

// DELETE /api/listings/:id
// TODO: implement per README.md sections 4 and 5.
export async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'removed' } },
      { new: true, runValidators: true }
    );

    if (!listing)
      return res.status(404).json({ message: 'Listing not found' });

  } catch (err) {
    next(err);
  }
}
export async function markListingAsSold(req, res, next) {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'sold' } },
      { new: true, runValidators: true }
    );

    if (!listing)
      return res.status(404).json({ message: 'Listing not found' });

     res.status(204).send();

  } catch (err) {
    next(err);
  }
}

