import { Link } from "react-router";
import { Button } from "./Button";
import { motion } from "framer-motion";

export  function Landing  () {
    return (
        <div className="mt-20 mx-20">
            <div className="flex md:flex-row justify-center items-center gap-10 m-10">
                <motion.div 
                className="flex flex-col justify-center items-center text-center gap-4 mt-20 mx-10"
                   initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.p className="text-4xl">Send and receive payments easily and securely.</motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                    >
                        Start using decentralized banking to send and receive money and to make your online purchases
                    </motion.p>
                    <Link to="/SignUp">
                     <motion.div whileHover={{ scale: 1.07 }}>
                        <Button text="Get Started" opaque/>
                     </motion.div>
                    </Link>
                </motion.div>

                <motion.div 
                className="w-lg"
                 initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                >
                    <img className="w-full" src="app/assets/landing.png" alt="Landing"/>
                </motion.div>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-10 my-40 mx-10">
                <motion.div 
                className="w-lg"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.7 }}
                >
                    <img className="w-full" src="/app/assets/security.png" alt="Security"/>
                </motion.div>
                <div>
                    <motion.p
                    className="text-3xl font-bold"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Totally secure according and in compliance with  EU policies
                    </motion.p>
                    <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="text-center">
                        Your data is safe with us. We use advanced encryption and security protocols to protect your information.
                    </motion.p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-20 my-20 mx-10">
                <div>
                    <div>
                        <p className="text-3xl text-center font-bold">Grow your business fast</p>
                    </div>

                    <div>
                        <div className="flex justify-start items-center my-10">
                            <div className="w-[60px]">
                                <img className="w-full" src="/app/assets/icon1.png" alt="Easy"/>
                            </div>
                            <p className="font-semibold">Start accepting online payments today.</p>
                        </div>
                    </div>

                    <div className="flex justify-start items-center my-10">
                        <div className="w-[60px]">
                            <img className="w-full" src="/app/assets/icon2.png" alt="Easy"/>
                        </div>
                        <p className="font-semibold">With instant payments</p>
                    </div>

                    <div className="flex justify-start items-center my-10">
                        <div className="w-[60px]">
                            <img className="w-full" src="/app/assets/icon3.png" alt="Easy"/>
                        </div>
                        <p className="font-semibold">Get paid seamlessly</p>
                    </div>

                </div>

                <div className="w-lg">
                    <img className="w-full" src="/app/assets/grow.png" alt="Easy"/>
                </div>
            </div>
        </div>
    )
};

export default Landing;