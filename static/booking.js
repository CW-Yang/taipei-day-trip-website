function get_user_schedule(user_info){
    $.ajax({
        url:'/api/booking',
        type:'get',
        headers: new Headers({
                        'Content-Type': 'application/json'
                    }),
        success: function(result){
            if(result['data'] != null){
                showInfo(user_info, result);
            }
            else{
                removeElement(user_info);
            }
        }
    })
}
function removeElement(user_info){
    let box = document.getElementById("box");
    let msg = document.createElement("div");
    let welcome = document.getElementById('headline');
    msg.classList.add("message");

    let child = box.lastElementChild;
    while(child){
        box.removeChild(child);
        child = box.lastElementChild;
    }
    welcome.textContent = "您好，"+user_info['name']+"，待預定的行程如下：";
    msg.textContent = "目前沒有任何待預定的行程";
    box.appendChild(msg);
}; 

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
                        location.replace('/');
                    }
                    else{
                        state.textContent = "登出系統";
                        let user_info = result['data'];
                        get_user_schedule(user_info);
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
function showInfo(user_info, data){
    let welcome = document.getElementById('headline');
    let pic = document.getElementById('picture');
    let frame1 = document.getElementById('frame1');
    let frame2 = document.getElementById('frame2');
    let frame4 = document.getElementById('frame4');
    let frame5 = document.getElementById('frame5');
    let name = document.getElementById('input_name');
    let email = document.getElementById('input_email');
    let confirm_fee = document.getElementById('confirm_fee');

    welcome.textContent = "您好，"+user_info['name']+"，待預定的行程如下：";
    data = data['data'];

    pic.src = data['attraction']['image'];

    frame1.textContent = "台北一日遊： "+data['attraction']['name'];
    frame2.textContent = data['date'];

    frame4.textContent = "新台幣 " + data['price'] + " 元";
    confirm_fee.textContent = "總價："+frame4.textContent;

    frame5.textContent = data['attraction']['address'];

    name.value = user_info['name'];

    email.value = user_info['email'];
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
