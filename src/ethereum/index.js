let primary;
let secondary;

export const initializeEthereum = nodeList => {
    return new Promise(D => {
        primary = nodeList.primary;
        secondary = nodeList.secondary;
        return D();
    });
};
export const getPrimary = () => primary;
export const getSecondary = () => secondary;

