const urls = {
    login: {url: '/api/login', method: 'POST'},
    logout: {url: '/api/logout', method: 'POST'},
    newGame: {url: '/api/game/create', method: 'POST'},
<<<<<<< HEAD
    view: {url: '/api/view?player=<player>', method: 'GET'},
    joinGame: {url: '/api/join', method: 'POST'} 
=======
    view: {url: '/api/view', method: 'GET'},
    joinGame: {url: '/api/join', method: 'POST'},
    deleteGame: {url: '/api/game/remove', method: 'POST'}
>>>>>>> e99faf74a1f582e4874944d878bfd2aaa9d69aa3
};


/**
 *
 * @param {string} type
 * @param {object} body
 * @param {function} [callback]
 * @param {function} [errorFn]
 */
export const apiCall = (type, body, callback, errorFn) => {
    const {url, method} = urls[type];

    let uurl = url;
    if (method === 'GET') {

        for (let param of Object.keys(body)) {
            uurl = uurl.replace('<' + param + '>', body[param]);
        }
    }
    console.log(body);
    fetch(uurl, {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        ...method !== 'GET' ? {body: JSON.stringify(body)} : {},
        credentials: 'include'
    }).then(response => {
        response.json().then(
            json => {
                const parsedResponse = {
                    status: response.status,
                    body: json
                };
                if (response.ok) return callback && callback(parsedResponse);
                return errorFn && errorFn(parsedResponse);
            }
        )
        // response.json().then(json => console.log(json));
        // if (response.ok) {
        //     return callback(response);
        // }
        // return errorFn && errorFn(response);
    });
};