const express = require("express");
const parser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
app.set("view engine", "ejs");
app.use(parser.urlencoded());
app.use(express.static("public"));


mongoose.connect("enter mongo srv here /todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "welcome to your todoList"
});

const item2 = new Item({
  name: "Hit + to add an item"
});

const item3 = new Item({
  name: "Hit - to remove an item"
});

const defaultItems= [item1, item2, item3];

const listSchema= new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

var today = new Date();
var options={
  weekday:"long",
  day:"numeric",
  month:"long"
};

var day=today.toLocaleDateString("en-US", options);

app.get("/", function(req, res) {


Item.find(async function(err, foundItems){

if(foundItems.length===0){
await Item.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully added default items to List");
    }
    res.redirect("/");
  });
}
else{
  res.render("list", {
    listTittle: day, newListItem: foundItems
  })
}
})
});

app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);

 List.findOne({name: customListName}, async function(err, foundList){
  if (!err){
    if (!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      await list.save();
      res.redirect("/" + customListName);
    }else{
      res.render("list", {listTittle: foundList.name, newListItem: foundList.items} );
    }
  }
});

});

app.post("/", async function(req,res){
    const itemName = req.body.listItem;
    const listName = req.body.add;


  const item = new Item({
      name: itemName
  });
  if(listName.substr(0,2)===day.substr(0,2)){
  await item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, async function(err, foundList){
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

app.post("/delete",async function(req,res){
  const checkedId = req.body.checkbox;
  const listName= req.body.listName;

  if(listName.substr(0,2)===day.substr(0,2)){
  await Item.findByIdAndRemove(checkedId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("deleted id: "+ checkedId );
      }
    })
    res.redirect("/");
  }else{
  await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

})

app.get("/work",function(req,res){
  res.render("list", { listTittle: "work", newListItem: workItems});
})

app.get("/about", function(req,res){
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("server has started successfully");
})
