// jwt authentication
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}  

// member system
async function login(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let state = document.getElementById("state");
    
    if(email == '' | password == ''){
        changeText("signin_tip", "請輸入帳號或密碼！", true);                   
    }
    else{
            let data = {

                "email":email,
                "password":password                        
            }
            $.ajax({
                    url:"/api/user",
                    type:"patch",
                    headers : new Headers({
                        'Content-Type': 'application/json'
                    }),
                    data:JSON.stringify(data),
                    success: function(result){
                        if(result["ok"] === undefined){
                            changeText("signin_tip", result["message"], true);
                        }
                        else{
                            location.reload();
                        }
                    }
            })
        }   
    
}
function signout(){
    $.ajax({
                url:"/api/user",
                type:"delete",
                headers : new Headers({
                    'Content-Type': 'application/json'
                }),
                success: function(){
                    location.reload();
                }
            })
}
async function signUp(){
    let name = document.getElementById("name").value;
    let email = document.getElementById("unsign_email").value;
    let password = document.getElementById("unsign_password").value;

    if(name == '' | email == '' | password == ''){
        changeText("signup_tip", "以上欄位不得為空", true);
    }
    else{
        let data = {
        "name":name,
        "email":email,
        "password":password
        }

        $.ajax({
            url:"/api/user",
            type:"post",
            headers : new Headers({
                    'Content-Type': 'application/json'
                }),
            data:JSON.stringify(data),
            success: function(result){
                if(result["ok"] === undefined){
                    changeText("signup_tip", result["message"], true)
                }
                else{
                    changeText("signup_tip", "註冊成功！", false)
                }
            }

        })
    } 
}

// menu action
function changeMenu(current_menu){
    let signin, signup;
    signin = document.getElementById("signin_menu");
    signup = document.getElementById("signup_menu");

    if(current_menu == 'signin'){
        signin.style.display = "none";
        signup.style.display = "block";
    }
    else{
        signin.style.display = "block";
        signup.style.display = "none";
    }
}

function changeText(idName, message, error){
    let tip = document.getElementById(idName);
    tip.textContent = message;
    if(error == true){
        tip.style.color = "red";
    }
    setTimeout(function(){
        if(idName == "signin_tip"){
            tip.textContent = "還沒有帳戶？點此註冊";
        }
        else{
            tip.textContent = "已經有帳戶了？點此登入"
        }
            tip.style.color = "#666666";
        }, 1500);
}
function signin(){
    let nav = document.getElementById("nav");
    let cover = document.getElementById("cover");
    let menu = document.getElementById("signin_menu");
    let state = document.getElementById("state");

    if(state.textContent != "登出系統"){
        nav.classList.remove("sticky");
        cover.classList.add("cover");
        menu.style.display = "block";
    }
    else{
        state.textContent = "登入/註冊";
        signout();
    }
    
} 
function closeMenu(){
    let nav = document.getElementById("nav");
    let cover = document.getElementById("cover");
    let menu_1 = document.getElementById("signin_menu");
    let menu_2 = document.getElementById("signup_menu");

    nav.classList.add("sticky");
    cover.classList.remove("cover");
    menu_1.style.display = "none";
    menu_2.style.display = "none";
} 
function mainPage(){
    location.replace('/');
}