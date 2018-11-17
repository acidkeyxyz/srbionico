var app = app || {};
var intlData = {
    locales: 'en-US'
}

app.generatePedido = function(){
    if (typeof (Storage) !== "undefined") {
        var slistPedido = localStorage.getItem("srbionico");
        if (slistPedido != null) {
            var listPedido = JSON.parse(slistPedido);
            app.pedido = [];
            for (var i = 0; i < listPedido.length; i++) {
                app.pedido.push(_.findWhere(app.products, { "productId": listPedido[i] }));
            }
        } else {
            app.pedido = [];
        }
    } else {
        alert("Sorry, your browser does not support Web Storage...");
    }
    
};

app.isOpen= false;
app.updateTotal = function(pedido){
    var owners = _.uniq( _.pluck(pedido, "productOwner"));
    var total = [];
    var bigTotal = 0;
    for (var i = 0; i < pedido.length; i++) {
	var currOwner = pedido[i].productOwner;
        bigTotal += pedido[i].productPrice;
        if(total[currOwner] == undefined){
		total[currOwner] = pedido[i].productPrice;
	}else{
		total[currOwner] += pedido[i].productPrice;
	}
    }
   var textTotal="";
   owners.forEach(function (elem){
       textTotal += elem +" $"+ total[elem].toFixed(2) +"<br>";
    });
   textTotal += " Total = $" +bigTotal.toFixed(2);
   $("#total").html(textTotal);
};
app.printPedido = function($parent,listItems){
    var liSource = "<div class='col-md-12 pedidoItem'>{{productName}} </strong>({{toUpperCase productSize}})</strong> {{formatNumber productPrice style=\"currency\" currency=\"MXN\"}}</div>";
    var liTemplate = Handlebars.compile(liSource);
    for(var i=0;i<listItems.length;i++){
        var html = liTemplate(listItems[i], { data: { intl: intlData } });    
        $($parent).append(html);
    }
};
app.hidePedido = function ($parent){
    $parent.html("");
};
app.clearPedido = function () {
    localStorage.setItem("srbionico","[]");
};

HandlebarsIntl.registerWith(Handlebars);
Handlebars.registerHelper('toUpperCase', function (str) {
    return (str != undefined) ? str.toUpperCase() : "";
});

app.storePedido = function(listPedido){
    if (typeof (Storage) !== "undefined") {
        var ids = _.pluck(listPedido, "productId");
        localStorage.setItem("srbionico", JSON.stringify(ids));
    } else {
        alert("Sorry, your browser does not support Web Storage...");
    } 
};
app.loadMenu = function(){
    app.generatePedido();
    app.updateTotal(app.pedido);
    $("#clearPedido").on("click", app.clearPedido);
    $("#items").delegate(".item", "click", function (e) {
        var currentId = parseInt($(this).attr("productId"));
        if ($(e.target).text() == "×"){
            app.pedido = _.without(app.pedido, _.findWhere(app.pedido, { "productId": currentId })) ;
            app.updateTotal(app.pedido);
            return;   
        }
        
        var currentProduct = _.findWhere(app.products, { "productId": currentId});
        app.pedido.push(currentProduct);
        app.storePedido(app.pedido);
        app.updateTotal(app.pedido);
    });
    $("#footer").on("click",function(){
        if(!app.isOpen){
            app.isOpen=true;
            $(this).animate({
                height: "100%",
            }, 1000, function () {
                app.printPedido($("#pedido"), app.pedido);
                $(".pedido").css("height", "90%");
                $(".total").css("height", "10%");
            });
        }else{
            $(".pedido").css("height", "0%");
            $(".total").css("height", "100%");
            app.isOpen = false;
            app.hidePedido($("#pedido"));
            $(this).animate({
                height: "117px"
            }, 500);
        }
    });
    app.products = _.sortBy(app.products, "productName");
    var source = "<div productId='{{productId}}' class='box col-xs-12 col-sm-6 col-md-3  item'> <h3>{{productName}} <button type='button' class='close' aria-label='Close'> <span aria-hidden='true'>×</span> </button></h3> <p><strong>{{toUpperCase productSize}}</strong> <label class='price' price='{{productPrice}}'>{{formatNumber productPrice style=\"currency\" currency=\"MXN\"}}</label></p></div>";
    var template = Handlebars.compile(source);
    for(var i=0;i<=app.products.length;i++){
        var html = template(app.products[i], {data: { intl: intlData } });
        $("#items").append(html);
    }
    $("#items").append(template({}, { data: { intl: intlData } }));
    
};
