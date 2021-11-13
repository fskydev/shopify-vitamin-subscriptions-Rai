import axios from "axios";

export const deleteOldSubscriptions = async (ctx) => {
    const reqBody = ctx.request.body;

    const customerId = reqBody.subscription.customer_id || null;
    const addressId = reqBody.subscription.address_id || null;
    const subscriptionId = reqBody.subscription.id || null;

    console.log(" ------- * - reqBody.subscription => ", reqBody.subscription);
    console.log(" ------- * - customerId => ", customerId);
    console.log(" ------- * - addressId => ", addressId);
    console.log(" ------- * - subscriptionId => ", subscriptionId);

    const response = await axios.get(
        `${process.env.RECHARGE_API_URL}/customers/${customerId}/addresses`,
        {
            headers: {
                'X-ReCharge-Access-Token': process.env.RECHARGE_API_KEY,
                Accept: 'application/json',
                "Content-Type": "application/json"
            },
        })
        .then(response  =>  {   return response })
        .catch(error    =>  {   return error.response   });
    
    console.log(" -------- response => ", response);
    if (response.status != 200) return;
    
    let addresses = response.data.addresses.filter( addr => {
       return addr.id != addressId;
    });

    console.log(" -------- response.data.addresses - count=> ", response.data.addresses.length);
    console.log(" -------- addresses - count=> ", addresses.length);

    if(addresses.length == 0) {
        ctx.status = 200;
        return;
    }

    for(const addr of addresses) {
        console.log(" *** -------- addr_id => ", addr.id);

        const response2 = await axios.get(
            `${process.env.RECHARGE_API_URL}/subscriptions?address_id=${addr.id}`,
            {
                headers: {
                    'X-ReCharge-Access-Token': process.env.RECHARGE_API_KEY,
                    Accept: 'application/json',
                    "Content-Type": "application/json"
                },
            })
            .then(response  =>  {   return response })
            .catch(error    =>  {   return error.response   });
        
        let subscriptions = response2.data.subscriptions;
        console.log(" -------- * - subscriptions", subscriptions);
        if (subscriptions.length == 0) {
            const response4 = await axios.delete(
                `${process.env.RECHARGE_API_URL}/addresses/${addr.id}`,
                {
                    headers: {
                        'X-ReCharge-Access-Token': process.env.RECHARGE_API_KEY,
                        Accept: 'application/json',
                        "Content-Type": "application/json"
                    },
                })
                .then(response  =>  {   return response })
                .catch(error    =>  {   return error.response   });
            console.log(" -------- response4 => ", response4.data);
            continue;
        }

        let data = {
            "subscriptions": [],
            "send_email":0
        }
        for(const subscription of subscriptions) {
            data.subscriptions.push({
                "id": subscription.id
            })
        }

        console.log(" -------- dataBody =>", data);

        const options = {
            method: 'DELETE',
            headers: { 
                'X-ReCharge-Access-Token': process.env.RECHARGE_API_KEY,
                Accept: 'application/json',
                "Content-Type": "application/json"
            },
            data: data,
            url: `${process.env.RECHARGE_API_URL}/addresses/${addr.id}/subscriptions-bulk`,
          };
        
        const response3 = await axios(options)
            .then(response  =>  {   return response })
            .catch(error    =>  {   return error.response   });

        console.log(" -------- response3 => ", response3.data);
        
        //delete address

        const response5 = await axios.delete(
            `${process.env.RECHARGE_API_URL}/addresses/${addr.id}`,
            {
                headers: {
                    'X-ReCharge-Access-Token': process.env.RECHARGE_API_KEY,
                    Accept: 'application/json',
                    "Content-Type": "application/json"
                },
            })
            .then(response  =>  {   return response })
            .catch(error    =>  {   return error.response   });
        console.log(" -------- response5 => ", response5.data);
    }
    console.log(" -------- Deleted the old subscriptions ---");
    ctx.status = 200;

};