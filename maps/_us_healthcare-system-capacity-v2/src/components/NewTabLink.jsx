import React from 'react';

// Safely open a link in a new tab with noopener and noreferrer
export default function NewTabLink({ href, children }) {
    return (
        <a target="_blank" rel="noopener noreferrer" href={href}>
            {' '}
            {children}{' '}
        </a>
    );
}
