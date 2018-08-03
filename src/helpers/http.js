const urls = {
  login: {url: '/api/login', method: 'POST'},
  logout: {url: '/api/logout', method: 'POST'},
  view: {url: '/api/view', method: 'GET'},
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
    fetch(url, {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        ...method !== 'GET' ? {body: JSON.stringify(body)} : {},
        credentials: 'include'
    }).then(response => {
        if (response.ok) {
            return callback(response);
        }
        return errorFn && errorFn(response);
    });
};