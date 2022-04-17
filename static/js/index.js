class AttractionsList{
    constructor(){
        this.keyword = null;
        this.flag = false;
        this.offset = 0;
    }
    parse(data, page){
        this.length = data.length;
        this.nextPage = page;
        this.name = [];
        this.mrtStation = [];
        this.category = [];
        this.images = [];

        for(let i = 0; i < this.length; i++){
            if(data[i]['name'] != 'null'){
                this.name.push(data[i]['name']);
            }
            else{
                this.name.push('')
            }
            if(data[i]['mrt'] != 'null'){
                this.mrtStation.push(data[i]['mrt']);;
            }
            else{
                this.mrtStation.push('')
            }
            if(data[i]['category'] != 'null'){
                this.category.push(data[i]['category']);
            }
            else{
                this.category.push('');
            }
            if(data[i]['category'] != 'null'){
                this.images.push(data[i]['images']);
            }
            else{
                this.images.push('');
            }
        }
    }
    test(){
        console.log(this.name);
        console.log(this.mrtStation);
        console.log(this.category);
        console.log(this.images);
        console.log(this.nextPage);
    }
    search(keyword){
        this.keyword = keyword;
    }
}
let flag = true;

let Attractions = new AttractionsList();
function loaded(){
    window.addEventListener('wheel', mouseWheel);
    window.addEventListener('scroll', scroll);
    url="/api/attractions?page=0"
    getAttractions(url);
};

async function getAttractions(url){
    if(!Attractions.flag){
        Attractions.flag = true;
        const response = await fetch(url);
        const result = await response.json();
        let count = result['data'].length;
        let data = result['data'];
        let Page = result['nextPage'];
        
        if(count > 0){
            Attractions.parse(data, Page);
            createElement();
        }
        else{
            alert("無相關結果");
        }
        Attractions.flag = false;
        
        makeRequestWithJWT();
    }
};
// infinite sing
function scroll(){              
    
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    // on the bottom
    if(scrollHeight - Math.trunc(scrollTop) - Math.trunc(clientHeight) <= 1){
        if(Attractions.keyword == null){
            url='/api/attractions?page='+ Attractions.nextPage;
        }
        else{
            url='/api/attractions?page='+ Attractions.nextPage + '&keyword=' + Attractions.keyword;
        }
        
        debounce(url);
    }
};
function debounce(url){
    if(Attractions.nextPage != null){
        getAttractions(url);
    }
};

function mouseWheel(e){
    let direction = e.deltaY;
    let screenWidth = screen.width;
    if(screenWidth > 1200){
        if(Attractions.nextPage == 1){
            if(direction > 0)
            {
            if(Attractions.keyword == null){
                url='/api/attractions?page='+ Attractions.nextPage;
            }
            else{
                url='/api/attractions?page='+ Attractions.nextPage + '&keyword=' + Attractions.keyword;
            }
            debounce(url);
            window.removeEventListener('wheel', mouseWheel);
            }
        }                     
    }              
};
function searching(){
    let textbox = document.getElementById("keyword");
    Attractions.keyword = textbox.value;
    if(textbox.value == ''){
        alert("請輸入關鍵字");
        Attractions.keyword = null;
    }
    else if(textbox.value == '請輸入景點名稱查詢'){
        alert("請輸入關鍵字");
        textbox.select();
        Attractions.keyword = null;
    }
    else{
        url = '/api/attractions?page=0&keyword='+Attractions.keyword;
        Attractions.nextPage = 0;
        Attractions.offset = 0;
        removeElement();
        window.addEventListener('wheel', mouseWheel);
        debounce(url);
    }
    console.log(Attractions.keyword);
};
function removeElement(){
    let container = document.getElementById("attractions");
    let child = container.lastElementChild;
    while(child){
        container.removeChild(child);
        child = container.lastElementChild;
    }
};
// Create Element
function createElement(){
    let attractions  = document.getElementById("attractions");
    let attraction, img, content, link;
    for(i=0; i<Attractions.length; i++){
        // <div class="attraction" />
        attraction = document.createElement("div");
        link = document.createElement("a");
        link.setAttribute('href', '/attraction/'+ ((Attractions.offset*12)+i+1).toString());
        link.setAttribute('style', 'text-decoration:none');
        attraction.classList.add("attraction");
        // <img src="" />
        img = document.createElement("img");
        img.src = Attractions.images[i][0];
        attraction.appendChild(img);
        for(j=0; j<3; j++){
            // <div class="content">
            content = document.createElement("div");
            content.classList.add("content");
            switch(j){
                case 0:
                    content.setAttribute('id', 'name');
                    // content.appendChild(document.createTextNode(Attractions.name[i]));
                    content.textContent = Attractions.name[i];
                    break;
                case 1:
                    content.setAttribute('id', 'mrt');
                    // content.appendChild(document.createTextNode(Attractions.mrtStation[i]));
                    content.textContent = Attractions.mrtStation[i];
                    break;
                case 2:
                    content.setAttribute('id', 'categoery');
                    content.appendChild(document.createTextNode(Attractions.category[i]));
                    // content.textContent = Attractions.mrtStation[i];
                    break;
            }
            attraction.appendChild(content);
        }
        link.appendChild(attraction);
        attractions.appendChild(link);
    }
    Attractions.offset++;
};
function textboxFocused(){
    let textbox = document.getElementById("keyword");
    if(textbox.value == "請輸入景點名稱查詢"){
        textbox.value = '';
    }
}
async function makeRequestWithJWT() {
    if(flag){
        flag = false;
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
                    }
                    else{
                        state.textContent = "登出系統";
                    }
                }
        })
        flag = true;
    }
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
                        location.replace('/booking'); // reload()
                    }
                }
        })
    
}