import axios from 'axios';

export const axiosGet = async (URL, route) => {
    const res = await axios.get(URL + "/" + route);
    return res.data;
};