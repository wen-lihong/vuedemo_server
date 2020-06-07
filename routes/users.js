var express = require('express');
var router = express.Router();
var users = require('./../models/users');
require('./../util/util');
/* GET users listing. */
router.get('/text', function(req, res, next) {
  res.send('respond with a resource');
});

//登录接口
router.post("/login", function(req, res, next) {
  console.log(req.body.userName)
  let params = {
  	userName:req.body.userName,
  	userPwd:req.body.userPwd
  }
  users.findOne(params,function(err,doc){  
  	if(err){   //数据库报的错误
  		res.json({
  			status:"1",
  			msg:err.message,
  			result:''
  		})
  	}else{
  		if(doc){  //有这个用户  返回用户名，并保存到cookie
           res.cookie("userId",doc.userId,{
           	path:'/',
           	maxAge:1000*60*60
           });
           res.cookie("userName",doc.userName,{
            path:'/',
            maxAge:1000*60*60
           });          
           res.json({
  			     status:"0",
  			     msg:'',
  			     result:{
              userName:doc.userName
              }           	
           })   
  		}else{
           res.json({
             status:"1",
             msg:'',
             result:''         
           })  
      }
  	}
  })
});
//检测登录接口
router.get("/relogin", function(req, res, next) {
  if(req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:{
        userName:req.cookies.userName
      }
    })
  }else{
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }
});
//登出接口
router.post("/loginOut", function(req, res, next) {
   res.cookie("userId","",{
    path:'/',
    maxAge:-1
   })
    res.json({
      status:'0',
      msg:'',
      result:''
    })
});

//购物车初始化接口
router.get("/cart",function(req,res,next){
  let userId = req.cookies.userId;
 users.findOne({userId:userId},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
    res.json({
      status:'0',
      msg:'',
      result:doc.cartList
    })
   }
  }
  })
})
//删除购物车商品
router.post("/editCart",function(req,res,next){
  let userId = req.cookies.userId,productId = req.body.productId;
 users.update({'userId':userId},{"$pull":{"cartList":{productId:productId}}},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
    res.json({
      status:'0',
      msg:'suc',
      result:''
    })
    console.log(doc)
     }else{
      res.json({
      status:'1',
      msg:'',
      result:''
    })
     }
  }
  })
})
// 商品加减接口
router.post("/checked",function(req,res,next){
  let userId = req.cookies.userId,productId = req.body.productId,productNum = req.body.productNum,
  checked = req.body.checked;
  console.log(checked)
 users.update({userId:userId,"cartList.productId":productId},{"cartList.$.productNum":productNum,
  "cartList.$.checked":checked},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
    res.json({
      status:'0',
      msg:'suc',
      result:''
    })
     }else{
      res.json({
      status:'1',
      msg:'',
      result:''
    })
     }
  }
  })
})
//
router.post("/checkedAll",function(req,res,next){
  let userId = req.cookies.userId,checkedAll = req.body.checkedAll;
 users.findOne({userId:userId},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
      doc.cartList.forEach((item)=>{
        item.checked=checkedAll
      })
    doc.save(function(err1,doc1){
            if(err1){
             res.json({
             status:'1',
             msg:'',
             result:''
          })
        }else{
          if(doc1){
          res.json({
          status:'0',
          msg:'suc',
          result:''
         })
       }
     }
    })
  }
  }
  })
}) 
//获取地址接口
router.get("/addressList",function(req,res,next){
  let userId = req.cookies.userId;
 users.findOne({userId:userId},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
      res.json({
       status:'0',
      msg:'',
      result:doc.addressList       
      })
    }
  }
})
})
//设置默认
router.post("/setDefault",function(req,res,next){
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  if(addressId){
 users.findOne({userId:userId},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
     let addressList = doc.addressList;
     addressList.forEach((item)=>{
      if(item.addressId==addressId){
        item.isDefault=true;
      }else{
        item.isDefault=false;
      }
     })
    doc.save(function(err1,doc1){
            if(err1){
             res.json({
             status:'1',
             msg:'',
             result:''
          })
        }else{
          if(doc1){
          res.json({
          status:'0',
          msg:'suc',
          result:''
         })
       }
     }
    })
    }
  }
})
}else{
  res.json({
      status:'1000',
      msg:'没有addressId',
      result:''
    })
}
})
//删除地址
router.post("/delAddress",function(req,res,next){
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
 users.update({'userId':userId},{"$pull":{"addressList":{addressId:addressId}}},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
    res.json({
      status:'0',
      msg:'suc',
      result:''
    })
     }else{
      res.json({
      status:'1',
      msg:'',
      result:''
    })
     }
  }
  })
}) 
//创建订单
router.post("/createOrder",function(req,res,next){
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  let orderTotol = req.body.Ordertotal;
  
 users.findOne({userId:userId},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc){
      let address='',goodsList=[]
      doc.addressList.forEach((item)=>{
        if(item.addressId==addressId){
          address=item
        }
      })
      doc.cartList.forEach((item)=>{
        if(item.checked==1){
         goodsList.push(item)
        }
      })
      let platForm="622";
      let r1 = Math.floor(Math.random()*10);
      let r2 = Math.floor(Math.random()*10);
      let systemDate=new Date().Format('yyyyMMddhhmmss')
      let createDate=new Date().Format('yyyy-MM-dd hh:mm:ss')
      let orderId=platForm+r1+systemDate+r2
      let order={
         orderId:orderId,
         orderTotol:orderTotol,
         goodsList:goodsList,
         address:address,
         orderStatus:1,
         orderCreateDate:createDate
      }
      doc.orderList.push(order)
    doc.save(function(err1,doc1){
            if(err1){
             res.json({
             status:'1',
             msg:'',
             result:''
          })
        }else{
          if(doc1){
          res.json({
          status:'0',
          msg:'suc',
          result:{
            'orderId':orderId,
           'orderTotol':orderTotol
          }
         })
       }
     }
    })
    }
  }
})
})
//查询订单
router.get("/orderSuccess",function(req,res,next){
  let userId = req.cookies.userId;
  let orderId = req.param('orderId');
  console.log(orderId)
 users.findOne({userId:userId},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    if(doc.orderList.length>0){
       let isorder = 0
      doc.orderList.forEach((item)=>{
        if(item.orderId==orderId){
          isorder=1;
             res.json({
               status:'0',
               msg:'',
               result:{
                orderId:item.orderId,
                orderTotol:item.orderTotol
               }
          })   
        }
      })
        if(isorder==0){
             res.json({
               status:'10001',
               msg:'无此订单',
               result:''
          })           
        }            
    }else{
             res.json({
               status:'10002',
               msg:'无订单',
               result:''
          })      
    }
    } 
})
}) 
//查询购物车数量
router.get("/cartCount",function(req,res,next){
  let userId = req.cookies.userId||'';
 users.findOne({userId:userId},function(err,doc){
  if(err){
    res.json({
      status:'1',
      msg:'',
      result:''
    })
  }else{
    let cartCount=0;
      doc.cartList.forEach((item)=>{
        cartCount += parseInt(item.productNum)
      })
         res.json({
            status:'0',
              msg:'',
             result:cartCount
    })      

    } 
})
})     
module.exports = router;
