SELECT TOP 5 P.DNI, P.Inspector, P.Tipo, P.Division, U.Id as UserId, U.IsActive 
FROM Personal P
LEFT JOIN Users U ON P.DNI = U.DNI
WHERE P.Tipo LIKE '%GERENTE%' OR P.Inspector LIKE '%GERENTE%';
