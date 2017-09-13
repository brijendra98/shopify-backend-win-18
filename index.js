const request = require('request');
const _ = require('underscore');
const express = require('express');
const app = express();

const port = 7467;

app.listen(port, () => {
    console.log('We are live on ' + port);

});

app.get('/', (req, res) => {


      var obtained = 0;
      var total;
      var result = {
        "invalid_customers": []
      };
      var validations;

      function get_data(page_num) {
          var options = {
            method: 'GET',
            url: 'https://backend-challenge-winter-2017.herokuapp.com/customers.json',
            qs: {
                  page: page_num
                }
          };
          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            //console.log(body);
            body = JSON.parse(body);
            total = body.pagination.total;
            obtained += body.customers.length;
            validations = body.validations;

            _.each(body.customers, function(customer){
              //console.log(customer);
              var customer_result = {"id": customer.id, "invalid_fields": []};
              _.each(validations, function(validation){
                _.each(validation, function(value, key){

                  if(value.required && !customer[key]) {
                    customer_result.invalid_fields.push(key);
                    //console.log(`Customer number ${customer.id} does not have a ${key}`);
                  }
                  if(value.type && customer[key] && value.type !== typeof(customer[key])) {
                    //console.log(`${customer[key]} should be a/an ${value.type}`);
                    customer_result.invalid_fields.push(key);
                  }
                  if(value.length && value.length.min && customer[key] && customer[key].length < value.length.min) {
                    //console.log(`${customer[key]} is shorter than ${value.length.min}`);
                    customer_result.invalid_fields.push(key);
                  }
                  if(value.length && value.length.max && customer[key] && customer[key].length > value.length.max) {
                    //console.log(`${customer[key]} is longer than ${value.length.max}`);
                    customer_result.invalid_fields.push(key);
                  }
                });
              });
              if(customer_result.invalid_fields.length) {
                result.invalid_customers.push(customer_result);
              }
            });
            if(obtained < total) {
              get_data(page_num+1);
            }
            else {
              console.log(JSON.stringify(result));
              res.status(200).send(result);
              //process.exit();
            }
          });
      }
      get_data(1);
});
