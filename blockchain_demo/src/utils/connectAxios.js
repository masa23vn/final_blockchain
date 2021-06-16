import axios from 'axios';

export const axiosGet = async (URL, route) => {
    const res = await axios.get(URL + "/" + route);
    return res.data;
};

export const axiosPost = async (URL, route, data) => {
    const res = await axios.post(URL + "/" + route, data);
    return res.data;
};