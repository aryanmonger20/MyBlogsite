var express= require("express")
var mongoose =require("mongoose")
var bodyParser=require("body-parser")
var methodOverride=require("method-override")
var expressSanitizer = require('express-sanitizer');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

var app =express();

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const port = 3000

app.use(methodOverride("_method"))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(expressSanitizer());

var blogSchema =new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date,default:Date.now}
})

var Blog =mongoose.model("Blog",blogSchema)

// Blog.create({
//     title :"Cute Dog",
//     image:"https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     body:"This is a super cute dog"
// })

//Routes

app.get("/",function(req,res){
    res.redirect("/blogs")
})

//index route
app.get("/blogs",function(req,res){
   Blog.find({},function(err,blogs){
       if(err){
           console.log("error !")
       }
       else{
        res.render("index",{blogs:blogs})
       }
   })
   
})

//NEW ROUTE
app.get("/blogs/new",function(req,res){
    res.render("new")
})

//Create Route
app.post("/blogs",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render("new")
        }
        else {
            res.redirect("/blogs")
        }
    })
})

//show route

app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs")
        }
        else{
            res.render("show",{blog:foundBlog})
        }
    })
})
//edit route
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs")
        }
        else{
            res.render("edit",{blog:foundBlog})
        }
    });
})
//update route
app.put("/blogs/:id",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updateBlog){
        if(err){
            res.redirect("/blogs")
        }
        else{
            res.redirect("/blogs/"+req.params.id)
        }
    })
})

//delete

app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs")
        }
        else
        {
            res.redirect("/blogs")
        }
    })
    })



app.listen(port, () => {
    console.log(`Server has started at:${port}`)
  })