const urls = {
    login: {url: '/api/login', method: 'POST'},
    logout: {url: '/api/logout', method: 'POST'},
    newGame: {url: '/api/game/create', method: 'POST'},
    view: {url: '/api/view', method: 'GET'},
    joinGame: {url: '/api/join', method: 'POST'},
    leaveGame: {url: '/api/leave', method: 'POST'},
    move: {url: '/api/game/move', method: 'POST'},
    msg: {url: '/api/game/message', method: 'POST'},
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
    const {url, method} = urls[type],
        _url = url + (method === 'GET' ? encodeQueryString(body) : '');

    fetch(_url, {
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
    });
};

const encodeQueryString = (params) => {
    const keys = Object.keys(params);
    return keys.length
        ? "?" + keys
        .map(key => encodeURIComponent(key)
            + "=" + encodeURIComponent(params[key]))
        .join("&")
        : ""
};