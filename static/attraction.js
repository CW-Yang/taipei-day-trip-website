class Attraction{
    constructor(){}
    getInfo(data){
        this.name = data['name'];
        this.mrtStation = data['mrt'];
        this.category = data['category'];
        this.address = data['address'];
        this.transport = data['transport'];
        this.description = data['descripition'];
        this.images = [];
        this.dataLength = data.length;
        this.imageLength = data['images'].length;

        for(let i = 0; i < this.imageLength; i++){
            this.images.push(data['images'][i]);
        }
    }
}

class Button{
    constructor(){
        this.clickCount = 0;
    }
    bind(left, right){
        this.left = left;
        this.right = right;
    }
}

let MyAttraction = new Attraction();
let MyButton = new Button();   
let ArrowButton = new Button(); 

function loaded(){
    let string = location.href;
    let startIndex = string.search('n/')+2;
    let endIndex = string.length;
    let id, str;

    str = string.substring(startIndex, endIndex);
    id = str;

    let btn = document.getElementById("btn1");
    btn.checked = true;

    getAttraction(id);
    makeRequestWithJWT();

    MyButton.bind(document.getElementById('left'), document.getElementById('right'));
    ArrowButton.bind(document.getElementById('btn1'), document.getElementById('btn2'));
}

async function getAttraction(id){
    const url = '/api/attraction';
    const param = id.toString();
    const request = await fetch(`${url}/${param}`);
    const response = await request.json();
    MyAttraction.getInfo(response['data']);

    showInfo();
}

function showInfo(){
    let pictureBox = document.getElementById("pictureBox");
    let name = document.getElementById("attractionName");
    let info = document.getElementById("info");
    let description = document.getElementById("description");
    let address = document.getElementById("address");
    let transport = document.getElementById("transport");
    let radio_list = document.getElementById("radio_list");

    for(let i = 0; i<MyAttraction.imageLength; i++){

        let radio_btn = document.createElement("input");

        radio_btn.setAttribute('type', 'radio');
        radio_btn.setAttribute('class', 'circle');
        radio_btn.setAttribute('id', 'circle'+i.toString());
        radio_btn.setAttribute('Enabled', 'false');
        radio_list.appendChild(radio_btn);
    }

    let url = 'url('+MyAttraction.images[0]+')';
    pictureBox.style.backgroundImage = url;
    
    name.textContent = MyAttraction.name;
    info.textContent = MyAttraction.category + ' at ' + MyAttraction.mrtStation;
    description.textContent = MyAttraction.description;
    address.textContent = MyAttraction.address;
    transport.textContent = MyAttraction.transport;

    radio_list.children[0].checked=true;
}

function select(time){
    let fee = document.getElementById('fee'); 
    if(time == 'morning')
    {
        fee.textContent = "新台幣 2000 元";
        ArrowButton.right.checked = false;                  
    }
    else{
        fee.textContent = "新台幣 2500 元";
        ArrowButton.left.checked = false;    
    }
}

function changeImage(action){
    
    let pictureBox = document.getElementById("pictureBox");
    let url;
    let length = MyAttraction.imageLength-1;

    let radio_btn = document.getElementById('radio_list').children[MyButton.clickCount];

    radio_btn.checked = false;
    
    if(MyButton.clickCount > 0){
        if(action == 'prev'){
            MyButton.clickCount--;
        }
        else{
            MyButton.clickCount++;
        }
    }
    else{
        if(action == 'next'){
           
            MyButton.clickCount++;
        }
    }

    if(MyButton.clickCount <= length){
        url = 'url('+MyAttraction.images[MyButton.clickCount]+')';
        pictureBox.style.backgroundImage = url;
        radio_btn = document.getElementById('radio_list').children[MyButton.clickCount];
        radio_btn.checked = true;
    }
    else{
        MyButton.clickCount = length;
        radio_btn.checked = true;
    }               
}

async function makeRequestWithJWT() {
        let state = document.getElementById("state");
        $.ajax({
                url:"/api/user",
                type:"get",
                headers :{
                        'X-CSRF-TOKEN': getCookie('csrf_access_token'),
                    },
                success: function(result){
                    console.log(result);
                    if(result['data'] === null){
                        state.textContent = "登入/註冊";
                        return "unsigned"
                    }
                    else{
                        state.textContent = "登出系統";
                        return "signed"
                    }
                }

        })              
    
}

function booking(){
    
    let fee = document.getElementById("fee");
    let price, during, date;
    date = document.getElementById("date").value;
    console.log(date);
    let string = location.href;
    let startIndex = string.search('n/')+2;
    let endIndex = string.length;
    let id;
    id = Number(string.substring(startIndex, endIndex));
    if(fee.textContent == "新台幣 2000 元"){
        price = 2000;
        during = "morning";
    }
    else{
        price = 2500;
        during = "afternoon";
    }
    data = {
        "attractionId":id,
        "date":date,
        "time":during,
        "price":price
    }
    $.ajax({
        url:'/api/booking',
        type:'post',
        headers : new Headers({
                    'Content-Type': 'application/json'
                }),
        data:JSON.stringify(data),
        success: function(result){
            if(result["ok"] === undefined){
                if(result["message"] == "尚未登入"){
                    signin();
                }
                else{
                    alert(result['message']);
                }
            }
            else{
                location.replace('/booking');
            }
        }
    })
}
function bookingPage(){
    $.ajax({
                url:"/api/user",
                type:"get",
                headers :{
                        'X-CSRF-TOKEN': getCookie('csrf_access_token'),
                    },
                success: function(result){
                    if(result['data'] === null){
                        signin();
                    }
                    else{
                        location.replace('/booking');
                    }
                }
        })
    
}