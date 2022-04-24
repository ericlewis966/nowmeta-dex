import React, {useEffect, useState} from "react"

const Image = ({alt, classname, src, fallbackSrc}) => {

    const [source, setSource] = useState(src);

    useEffect(() => {
        setSource(src);
    }, [src])

    return(
        <img alt={alt} className={classname} src={source} onError={() => setSource(fallbackSrc)}/>
    )
}

export default Image;