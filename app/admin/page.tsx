"use client";

import { useEffect, useState } from "react";
import { getTotalOrderCount, getTotalUserCount, getTotalMoney } from "@/app/services/kpi/kpi";

export default function Admin() {
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const [userCount, setUserCount] = useState<number | null>(null);
    const [TotalMoney, setTotalMoney] = useState<string | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            const orderCountData = await getTotalOrderCount(); 
            setOrderCount(orderCountData);

            const userCountData = await getTotalUserCount(); 
            setUserCount(userCountData);

            const totalMoneyData = await getTotalMoney(); 
            setTotalMoney(totalMoneyData);
        };

        fetchData();
    }, []);

    const kpiData = [
        {
            title: "Nombre de commandes",
            value: orderCount !== null ? orderCount.toString() : "Loading...", 
            icon: "pi pi-shopping-cart",
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-600"
        },
        {
            title: "Nombre d'utilisateurs",
            value: userCount !== null ? userCount.toString() : "Loading...", 
            icon: "pi pi-users",
            bgColor: "bg-blue-100",
            textColor: "text-blue-600"
        },
        {
            title: "Revenu total",
            value: TotalMoney !== null ? TotalMoney.toString() : "Loading...",
            icon: "pi pi-dollar",
            bgColor: "bg-green-100",
            textColor: "text-green-600"
        }

    ];

    return (
        <div className="h-full bg-primaryBackgroundColor p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Données importantes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpiData.map((kpi, index) => (
                    <div
                        key={index}
                        className={`flex items-center p-6 rounded-lg shadow-md ${kpi.bgColor} hover:scale-105 transform transition duration-200`}
                    >
                        <div className={`text-4xl p-4 rounded-full ${kpi.textColor}`}>
                            <i className={kpi.icon}></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-lg font-medium text-gray-600">{kpi.title}</p>
                            <p className={`text-2xl font-bold ${kpi.textColor}`}>{kpi.value}  </p>
                        </div>
                    </div>
                ))}
            </div>
           
        </div>
    );
}
