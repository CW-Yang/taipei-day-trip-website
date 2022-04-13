class Attraction{
    constructor(){}
    parse(data){
        this.data = data['data'];
        this.id = this.data['attraction']['id'];
        this.image = this.data['attraction']['image'];
        this.name = this.data['attraction']['name'];
        this.address = this.data['attraction']['address'];
        this.price = this.data['price'];
        this.date = this.data['date'];
        this.time = this.data['time'];
    }
}
class Guest{
    constructor(){}

    getInfo(data){
        this.name = data['name'];
        this.email = data['email'];
    }
}

let attraction = new Attraction();
let buyer = new Guest();

function init(){
    makeRequestWithJWT();
    let fields = {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: document.getElementById('card-expiration'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'CCV'
        }
    }
    TPDirect.setupSDK(11327, 'app_whdEWBH8e8Lzy4N6BysVRRMILYORF6UxXbiOFsICkz0J9j1C0JUlCHv1tVJC', 'sandbox');
    TPDirect.card.setup({
        fields: fields
    });
}

function get_user_schedule(){
    $.ajax({
        url:'/api/booking',
        type:'get',
        headers: new Headers({
                        'Content-Type': 'application/json'
                    }),
        success: function(result){
            if(result['data'] != null){
                attraction.parse(result);
                showInfo();
            }
            else{
                removeElement();
            }
        }
    })
}
function removeElement(){
    let box = document.getElementById("box");
    let msg = document.createElement("div");
    let welcome = document.getElementById('headline');
    msg.classList.add("message");

    let child = box.lastElementChild;
    while(child){
        box.removeChild(child);
        child = box.lastElementChild;
    }
    welcome.textContent = "您好，"+buyer.name+"，待預定的行程如下：";
    msg.textContent = "目前沒有任何待預定的行程";
    box.appendChild(msg);
}; 

async function makeRequestWithJWT(){
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
                        location.replace('/');
                    }
                    else{
                        state.textContent = "登出系統";
                        let user_info = result['data'];
                        buyer.getInfo(user_info);
                        get_user_schedule();
                    }
                }
        })              
        .fail(function(){
            state.textContent = "登入/註冊";
            location.replace('/');
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
    location.replace('/booking');
}
function showInfo(){
    let welcome = document.getElementById('headline');
    let pic = document.getElementById('picture');
    let frame1 = document.getElementById('frame1');
    let frame2 = document.getElementById('frame2');
    let frame4 = document.getElementById('frame4');
    let frame5 = document.getElementById('frame5');
    let name = document.getElementById('input_name');
    let email = document.getElementById('input_email');
    let confirm_fee = document.getElementById('confirm_fee');

    welcome.textContent = "您好，"+buyer.name+"，待預定的行程如下：";

    pic.src = attraction.image;

    frame1.textContent = "台北一日遊： "+attraction.name;
    frame2.textContent = attraction.date;

    frame4.textContent = "新台幣 " + attraction.price + " 元";
    confirm_fee.textContent = "總價："+frame4.textContent;

    frame5.textContent = attraction.address;

    name.value = buyer.name;

    email.value = buyer.email;
}
function deleteSchedule(){
    $.ajax({
        url:'/api/booking',
        type:'delete',
        headers : new Headers({
                    'Content-Type': 'application/json'
                }),
    })
    .done(function(result){
        console.log(result);
        location.reload();
    })
    .fail(function(result){
        console.log(result);
    })
}

function getOrder(){
    let result = {
        "price": Number(attraction.price),
        "trip":{
            "attraction":{
                "id":attraction.id,
                "name":attraction.name,
                "address":attraction.address,
                "image":attraction.image
            },
            "date":attraction.date,
            "time":attraction.time
        }
    }
    return result;
}
function getContact(){
    let number = document.getElementById('input_phone_number').value;
    if(number == '' | number == null){
        alert('請輸入手機號碼');
        return null;
    }
    else{
        let result = {
            "name":buyer.name,
            "email":buyer.email,
            "phone":Number(number)
        }
        return result;
    }
}
function isUserNameCurrect(userName){
    if(userName.value == ''){
        userName.setAttribute("style", "border:solid 1px red");
        return false
    }
    else{
        userName.setAttribute("style", "border:solid 1px green");
    }
    
    return true;
}
function isEmailCurrect(email){
    let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(!regex.test(email.value)) {
        email.setAttribute("style", "border:solid 1px red");
        return false;
    }
    else{
        email.setAttribute("style", "border:solid 1px green");
    }
    return true;
}
function isPhoneNumberCurrect(number){
    if(number.style.border == "1px solid green"){
        return true;
    }
    number.setAttribute("style", "border:solid 1px red");
    return false;
}

function checkInformation(){
    let userName = document.querySelector('#input_name');
    let email = document.querySelector('#input_email');
    let phone = document.querySelector('#input_phone_number');
    

    if(isUserNameCurrect(userName) & isEmailCurrect(email) & isPhoneNumberCurrect(phone)){
        getPrime();
    }
}

function getPrime(){
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();

    if(tappayStatus.canGetPrime === false){
        alert('付款資訊有誤');
        return;
    }
    TPDirect.card.getPrime(function(result){
        if(result.status !== 0){
            console.log('getPrime 錯誤');
            return;
        }
        else{
            let data = {
                "prime":result.card.prime,
                "order":getOrder(),
                "contact":getContact()
            }
            $.ajax({
                url:'/api/orders',
                type:'post',
                headers: new Headers({
                    'Content-Type':'application/json'
                }),
                data:JSON.stringify(data)
            })
            .done(function(result){
                let number;
                if(result['data'] != undefined){
                    number = result['data']['number'];
                    // deleteSchedule();
                }
                else{
                    number = result['message']['number'];
                    alert(result['message']['msg']);
                }
                location.replace('/thankyou?number='+number);
            })
        }
    })
}

function getTradeInfo(data){
    $.ajax({
        url:'/api/orders/'+data,
        type:'get',
        headers: new Headers({
            'Content-Type':'application/json'
        }),
    })
    .done(function(result){
    })
}

$('#input_phone_number').bind('input propertychange', function checkFormat(e){
    let textbox = e.target;
    let word = textbox.value[textbox.value.length - 1];
    if(textbox.value.length > 0){
        if(!isNaN(Number(word))){
            if(textbox.value.length < 10 | textbox.value.substring(0, 2) != "09"){
                textbox.setAttribute("style", "border:solid 1px red");
                if(textbox.value.length > 10){
                    textbox.value = textbox.value.substring(0, 10);
                }
            } 
            else{
                textbox.setAttribute("style", "border:solid 1px green");
                textbox.value = textbox.value.substring(0, 10);
            }
        }
        else{
            if(textbox.value.length <= 1){
                textbox.value = '';
            }
            else if(textbox.value.length > 1){
                textbox.value = textbox.value.substring(0, textbox.value.length-1);
            }
        }
    }
})


