let primary: any;
let secondary: any;

export const initializeEthereum = (nodeList: any) => {
    return new Promise(D => {
        primary = nodeList.primary;
        secondary = nodeList.secondary;
        // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        return D();
    });
};
export const getPrimary = () => primary;
export const getSecondary = () => secondary;

