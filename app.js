var express = require("express");
var app = express();
var request =  require("request");
var bodyParser = require("body-parser");
var  mongoose = require("mongoose");
var camp = require("./models/campModel");
var comment =  require("./models/comment");
var expressBack =  require("express-back");
var methodOverride = require('method-override');
var user =  require("./models/user");
var passport = require("passport");
var eSession = require("express-session");
var passportLocalMongoose = require("passport-local-mongoose");
var localStrategy = require("passport-local");
var seed = require("./seed");

mongoose.connect("mongodb://localhost/yelpcamp",{useNewUrlParser:true});
app.use(eSession({
    secret:"This app is made by Dinesh Pabbi",
    saveUninitialized:false,
    resave:false
    
}));
app.use(expressBack());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// seed();
// user.findOneAndUpdate({username:"pabbi@gmail.com"},{$set:{permission:"admin"}},(err,result)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log(result);
//     }
// });

app.get("/",(req,res)=>{
    console.log(req.user);
    res.render("home.ejs");
})

app.get("/camps/new",isAdmin,(req,res)=>{
    res.render("new.ejs")
})


app.post("/camps",(req,res)=>{
    // var n = req.body.names;
    // var u = req.body.url;
    // var newitem = {
    //     name:n,
    //     url:u
    // }
    camp.create(req.body.c,(err,camp)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/camps");
        }
    })

})

app.put("/camps/:id",(req,res)=>{
    camp.findByIdAndUpdate(req.params.id,req.body.c,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/camps");
        }
    })
});

app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.post("/login",passport.authenticate("local",{
    successRedirect: "/camps",
    failureRedirect:"/login"
}),(req,res)=>{});

app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});

app.post("/signup",(req,res)=>{
    user.register({username:req.body.username},req.body.password,(err,result)=>{
        if(err){
            console.log(err);
            res.redirect("/signup");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/");
        })
    });
})

app.get("/camps",(req,res)=>{
    camp.find({},(err,camps)=>{
        if(err){
            console.log(err);
        }else{
            res.render("camps.ejs",{camps:camps});
        }
    })

}); 

app.get("/camps/:id",(req,res)=>{
    camp.findById(req.params.id).populate("comments").exec((err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.render("desc.ejs",{c:result});
        }
    });
});

app.get("/camps/:id/edit",isAdmin,(req,res)=>{
    camp.findById(req.params.id,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.render("edit.ejs",{camp:result});
        }
    });
    
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
})

app.get("/camps/comment/:id",isLoggedIn,(req,res)=>{
    res.render("comment.ejs",{id:req.params.id});
});

app.post("/camps/comment/:id",(req,res)=>{
    var com = new comment(req.body.c);
    com.save();
    camp.findById(req.params.id,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            result.comments.push(com);
            result.save();
            var u = "https://dinesh-sentiment-api.herokuapp.com/lstmresult?review="+com["content"];
            request(u,(err,response,body)=>{
                if(err){
                    console.log(err);
                }else{
                    output = JSON.parse(body);
                    keywords = output["Keywords"].join();
                    if(output["Sent"] == "Negative"){
                        res.redirect("/feedback/"+keywords+"/"+req.params.id);
                    }else{
                        res.redirect("/camps/"+req.params.id);
                    }
                }
            });
        }
    });
});

app.get("/feedback/:keywords/:id",(req,res)=>{
    res.render("feedback.ejs",{keywords:req.params.keywords})
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}
function isAdmin(req,res,next){
    if(req.isAuthenticated()){
        user.findOne({username:req.user.username},(err,u)=>{
            if(err){
                console.log(err);
                res.redirect("/login");
            }else{
                if(u.permission == "admin"){
                    return next()
                }else{
                    res.redirect("/");
                }
            }
        });
    }else{
        res.redirect("/login");
    }
}
app.listen(3000,()=>{console.log("Server is up and running !")});