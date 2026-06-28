USE master;
go



create database HireMe
on primary(
	name=N'HireMe',
	filename=N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\HireMe.mdf',
	size=10240KB,
	maxsize=unlimited,
	filegrowth=1024KB
),
filegroup fg1(
	name=N'HireMe_fg1',
	filename=N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\HireMe_fg1.ndf',
	size=10240KB,
	maxsize=unlimited,
	filegrowth=1024KB
)
log on(
	name = N'HireMe_log',
	filename=N'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\DATA\HireMe_log.ldf',
	size=10240KB,
	maxsize = 5GB,
	filegrowth=10240KB
	);

	go