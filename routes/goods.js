var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');
var users = require('../models/users');

//链接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/db_demo',{ useUnifiedTopology: true,useNewUrlParser: true});

mongoose.connection.on("connected",function(){
	console.log("MongoDB connected success")
});
mongoose.connection.on("error",function(){
	console.log("MongoDB connected fail")
});
mongoose.connection.on("disconnected",function(){
	console.log("MongoDB connected disconnected")
});

//商品列表查询接口
router.get("/",function(req,res,next){
	let page = Number(req.param('page'));
	let pagesize = Number(req.param('pagesize'));
	let sort = Number(req.param('sort'));
	console.log(page,pagesize,sort)
	// let page = req.param('page');
	// let pagesize = req.param('pagesize');
	// let sort = req.param('sort');
	let skip = (page-1)*pagesize;
    let params = {};
	let priceLevel = req.param('priceLevel');
	let priceGt=''; let priceLet='';
    if(priceLevel!='All'){
    	switch(priceLevel){
    		case'0':priceGt=0;priceLet=100;break;
    		case'1':priceGt=100;priceLet=500;break;
    		case'2':priceGt=500;priceLet=1000;break;
    		case'3':priceGt=1000;priceLet=5000;break;
    	};
        params={
        	salePrice:{
        		$gt:priceGt,
        		$lte:priceLet
        	}
        }
    }
	let GoodsModel = Goods.find(params).skip(skip).limit(pagesize)
	GoodsModel.sort({'salePrice':sort})
	 GoodsModel.exec(function(err,doc){
     if(err){
     	res.json({
     		status:'1',
     		msg:'数据库err'
     	});
     }else{
     	res.json({
     		status:'0',
     		msg:'gg',
     		result:{
     			count:doc.length,
     			list:doc
     		}
     	})
     }
	})
} )

//加入购物车接口
router.post("/addCart",function(req,res,next){
    //判断有没有这个用户
    let productId = req.body.productId;
    let userId = "100000077";
    users.findOne({userId:userId},function(err,userDoc){
        if(err){
            res.json({
                status:1,
                msg:err.message
            })
        }else{
            console.log('userDoc:'+userDoc)
           if(userDoc){  //如果有这个用户，然后就查询这个用户下面有没有这个商品,没有这个商品，就查找出这个商品，然后加入到用用户的购物车里面。
              let goodsItem = '';
              userDoc.cartList.forEach(function(item){
                if(item.productId == productId){
                    item.productNum ++;
                    goodsItem = item;
                }
              })
                if(goodsItem){
                userDoc.save(function(err2,doc2){
                            if(err2){
                               res.json({
                                  status:1,
                                  msg:err2.message
                                }) 
                            }else{
                               res.json({
                                status:0,
                                msg:'',
                                result:'suc'
                               }) 
                            }
                          }) 
                }else{
                  Goods.findOne({productId:productId},function(err1,doc){
                    if(err1){
                      res.json({
                        status:1,
                        msg:err1.message
                      })  
                    }else{
                        if(doc){
                        var doc = doc.toObject()
                        doc.productNum = 1;
                        doc.checked  = 1;
                        doc.a = 2;
                        let obj={b:3}
                        obj.a=1
                        console.log('obj:'+obj.a);
                        console.log(obj);
                        console.log(doc);
                        console.log(typeof doc);
                        userDoc.cartList.push(doc);
                        userDoc.save(function(err2,doc2){
                            if(err2){
                               res.json({
                                  status:1,
                                  msg:err2.message
                                }) 
                            }else{
                               res.json({
                                status:0,
                                msg:'',
                                result:'suc'
                               }) 
                            }
                          }) 
                        }                       
                    }
                  })
                }
           }   
        }
    })
})

module.exports = router;