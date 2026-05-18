<?php

namespace App;

enum OrderType: string
{
    case Takeaway = 'takeaway';
    case Delivery = 'delivery';
}
