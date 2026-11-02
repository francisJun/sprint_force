@extends('errors.layout')

@section('title', 'Server Error')
@section('code', '500')
@section('header', 'Internal Server Error')
@section('message', 'A server-side execution anomaly occurred. Our audit logging engine has recorded the event for diagnostic review.')

