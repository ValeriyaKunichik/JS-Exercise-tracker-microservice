const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser= require('body-parser')

const mongoose=require('mongoose')
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track')
const {Schema} = mongoose;
const personSchema= new Schema({username: String});
const Person= mongoose.model('Person', personSchema)

const exerciseSchema= new Schema({userid: String, description: String, duration: Number, date: Date});
const Exercise= mongoose.model('Exercise', exerciseSchema)
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const newPerson= new Person({username: req.body.username});
  
  newPerson.save((err,data)=>{
    console.log("ROQBODY:"+newPerson)
    console.log("DATA"+data)
    res.json({
  username: data.username,
  _id: data.id
})
  })
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let { _id } = req.params;
  console.log(_id)
  var date= req.body.date;
  if (date==undefined || date=='')
  {
  date = new Date();
  }
  let username;
  
  //id = mongoose.Types.ObjectId(_id)
  id=_id
  Person.findById(id, (err,data)=>{
    console.log(id)
    console.log(data)
    if(!data){
      console.log("Unknown userId")
    }
    else{
      username=data.username;
    }
  })

  const newExercise= new Exercise({userid: _id, description: req.body.description, duration: req.body.duration, date: date});
  
  newExercise.save((err,data)=>{
    
    console.log("DATA"+data)
    let ex={_id:_id, username: username, date: data.date.toDateString(), duration: data.duration, description: data.description}
    res.send(ex)
  })
});

app.get('/api/users', (req, res) => {
  Person.find({}, (err,data)=>{
    if (!data){
      res.send("No users")
    }
    else
    {res.json(data)}
  })    
});


app.get('/api/users/:_id/logs', (req, res) => {
  var { _id } = req.params; 
  var limit;
    if (req.query.from){
          var from_date=new Date(req.query.from);}
    else{var from_date=new Date('1970-01-01Z00:00:00:000');}
    
    if (req.query.to){
          var to_date=new Date(req.query.to);}
    else{var to_date=new Date('2100-01-01Z00:00:00:000');}
    if (req.query.limit!=undefined){
    limit=Number(req.query.limit);}
    else
    {limit=undefined}



    Person.findById(_id, (err,data)=>{ 
    if(!data){
      console.log("Unknown userId")
    }
    else{
      
      const username= data.username;
      Exercise.find({userid:_id}).where("date").gt(from_date).lt(to_date).limit(limit).select(["id","description","duration","date"]).exec( (err,data)=>{
          let customdata= data.map(exer=>{
            
            return {description: exer.description, duration:exer.duration, date: new Date(exer.date).toDateString()}
          })
          if(!data){
            res.json({
              _id:_id, username: username, count: 0, log:[]
            })
          }
         else{
           res.json({
              _id:_id, username: username, count: data.length, log:customdata
            })            
         }
      })
    }
  }) 
    
    
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
