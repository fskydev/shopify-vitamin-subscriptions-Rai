import axios from "axios";

export const createRechargeWebhooks = async (
    callbackPath,
    topic    
  ) => {
    const address  = process.env.HOST + callbackPath;

    const response = await axios.post(
        `${process.env.RECHARGE_API_URL}/webhooks`,
        {
            address,
            topic
        }, {
            headers: {
                'X-ReCharge-Access-Token': process.env.RECHARGE_API_KEY,
                Accept: 'application/json',
                "Content-Type": "application/json"
            },
        })
        .then(response  =>  {   return response })
        .catch(error    =>  {   return error.response   });
    
    if (response.status === 200) {
        console.log(" -------- Successfully created subscription webhook!");
        console.log(" -------- response => ", response.data);
    }
};