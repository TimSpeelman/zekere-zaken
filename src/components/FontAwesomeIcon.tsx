import React from 'react';

export function FaIcon(props: any) {
    const keys = Object.keys(props);
    return <i className={`fas fas-${keys[0]}`}></i>
}
