const TitleSection = () => {
    const title = "NAVIGATING THE FUTURE OF MEMORY";
    const subtitle = "2075 | The boundary between memory and privacy";
    return (
        <header className="flex flex-col items-center justify-center text-center gap-4">
            <h1 className="font-pixel leading-tight text-5xl font-bold text-cyan-300 tracking-wide">
                {title}
            </h1>
            <p className="font-pixel text-xl font-medium text-cyan-300 tracking-wider opacity-90">
                {subtitle}
            </p>
        </header>
    );
};

export default TitleSection;