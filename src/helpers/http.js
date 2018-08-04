const urls = {
    login: {url: '/api/login', method: 'POST'},
    logout: {url: '/api/logout', method: 'POST'},
    newGame: {url: '/api/game/create', method: 'POST'},
    view: {url: '/api/view', method: 'GET'},
    joinGame: {url: '/api/join', method: 'POST'},
    deleteGame: {url: '/api/game/remove', method: 'POST'}
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
    console.log(body);
    fetch(url, {
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