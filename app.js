const express = require("express");
const BodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
const PORT = process.env.PORT || 3030;

app.set('view engine', 'ejs');

app.use(BodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abhijeet:Abhi1796@cluster0.eruxyi0.mongodb.net/todolistDB");

const itemSchema = {
  name:String
};

const Item  = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Welcome to your to do list!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item!"
});

const item3 = new Item({
  name:"<--Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema ={
  name:String,
  items:[itemSchema]
};

const List =  mongoose.model("List",listSchema);

// Item.insertMany(defaultItems).then(function () {
//   console.log("Successfully saved in databases");
// }).catch(function (err) {
//   console.log(err);
// });

app.get("/",function (req,res) {
  Item.find({}).then(function (foundItems) {
    if(foundItems.length===0){
      Item.insertMany(defaultItems).then(function () {
        console.log("Successfully saved in databases");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }else{
        res.render("list",{ listTitle:"Today",newListitems:foundItems});
    }
  }).catch(function (err) {
    console.log(err);
  });

});

app.get("/:customListName",function (req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then(function (foundList) {
    if(!foundList){
      const list = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+ customListName);
    }else{
      res.render("list",{ listTitle: foundList.name , newListitems:foundList.items});
    }
  }).catch(function (err) {
      console.log(err);
    });
});



app.get("/about",function (req,res) {
  res.render("about");

});

app.post("/",function (req,res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function (req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function () {
        console.log("Successfully deleted checked item");
        res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function (foundList) {
        res.redirect("/" + listName)

    });
  }
});


app.listen(PORT,function () {
  console.log(`server started on port ${PORT}`);
})
