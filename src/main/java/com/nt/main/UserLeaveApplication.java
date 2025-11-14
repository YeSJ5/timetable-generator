package com.nt.main;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/userleaveapplication")
public class UserLeaveApplication extends HttpServlet{
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		PrintWriter pw=res.getWriter();
		res.setContentType("text/html");
		pw.println("user leave application");
		String regno=req.getParameter("regno").toUpperCase();
		String arrivalDate=req.getParameter("arrival_date");
		String departDate=req.getParameter("departure_date");
		String reason=req.getParameter("reason");
		pw.println(regno);
		pw.println(arrivalDate);
		pw.println(departDate);
		pw.println(reason);


		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
			PreparedStatement ps=con.prepareStatement("INSERT INTO LEAVEAPPLICATION VALUES(?,TO_DATE(?,'YYYY-MM-DD'),TO_DATE(?,'YYYY-MM-DD'),?)");
			ps.setString(1,regno );
			ps.setString(2, arrivalDate);
			ps.setString(3, departDate);
			ps.setString(4, reason);
			int count=ps.executeUpdate();
			if(count==1) {
				res.sendRedirect("success.html");
			}
			pw.print(count);
			con.close();
		}catch(Exception e) {
			e.printStackTrace();
			res.sendRedirect("InvalidCredentials.html");
		}
	}
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req, res);
	}
}
