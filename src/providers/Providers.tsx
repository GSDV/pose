import { ReactNode, Fragment } from 'react';



export default function Providers({ children }: { children: ReactNode }) {
    return (
        <Fragment>
            {children}
        </Fragment>
    );
}