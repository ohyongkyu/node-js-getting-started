const axios = require('axios');

const libApi = {
    getHeaders: function(accessToken) {
        const headers = {
            'Authorization': "Bearer " + accessToken,
            'Content-Type': "application/json"            
        };
        return headers;
    },

    setScriptTags: async function(mallId, accessToken, payload) {        
        try {
            const headers = this.getHeaders(accessToken);
            const endpoint = `https://${mallId}.cafe24api.com/api/v2/admin/scripttags`;

            const response = await axios.post(endpoint, payload, {'headers': headers});

            console.log(response);
        } catch (error) {            
            console.log(error);
        }        
    }
};

module.exports = libApi;