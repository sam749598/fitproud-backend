import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        unique:true,
        lowercase:true
    },
    content:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    category: { 
        type: String,
        required:true 
    },
    extraImages: [{ 
        type: String 
    }],
    videos: [{ 
        type: String 
    }],
    published: { 
        type: Boolean, 
        default: false
     },

    // SEO fields 
     metaTitle: {
         type: String 
        },
    metaDescription: { 
        type: String 
    },
     tags: [{ 
        type: String 
    }],   

},{ timestamps: true });


// Auto-generate slug before save if not set

blogSchema.pre("validate", function(next){
  if(this.title && !this.slug){
    this.slug=slugify(this.title,{lower: true, strict: true })
  }
  next();
})

export default mongoose.model("Blog", blogSchema)