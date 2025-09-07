const QRCode = () => {
    return (
    <section className="overflow-hidden">
        <div className="h-full w-full flex flex-col items-center justify-center gap-10">
            <div className="w-100 h-100 bg-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center">
                <span className="text-cyan-300 text-6xl text-center" >
                    QR CODE
                </span>
            </div>
            <p className="text-4xl text-cyan-300 text-center">
                Existing Player 3 / 5
            </p>
        </div>
    </section>
    );
}

export default QRCode;