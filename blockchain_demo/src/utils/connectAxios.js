import axios from 'axios';

export const axiosGet = async (URL, route) => {
    const res = await axios.get(URL + "/" + route);
    return res.data;
};

let username = '';
let password = '';

export const setAxiosAuth = async (name, pass) => {
    username = name;
    password = pass;
};

export const axiosPost = async (URL, route, data) => {
    const res = await axios.post(URL + "/connect/" + route, data, {
        auth: {
            username: username,
            password: password
        },
    });
    return res.data;
};